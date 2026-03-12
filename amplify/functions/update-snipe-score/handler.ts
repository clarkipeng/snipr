import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SNIPE_TABLE = process.env.SNIPE_TABLE_NAME!;
const SNIPE_VOTE_TABLE = process.env.SNIPE_VOTE_TABLE_NAME!;
const USER_PROFILE_TABLE = process.env.USER_PROFILE_TABLE_NAME!;

export const handler = async (event: any) => {
  const { snipeId, delta, userProfileId: clientProfileId } = event.arguments as {
    snipeId: string;
    delta: number;
    userProfileId?: string;
  };
  const sub = event.identity?.sub || event.identity?.claims?.sub;

  if (typeof delta !== "number" || !Number.isFinite(delta)) {
    throw new Error("Invalid delta");
  }
  if (!sub) {
    throw new Error("Unauthenticated");
  }

  // Always store vote under UserProfile id when provided so the frontend's hasVoted
  // check (which uses currentUserId) will find it. Fall back to sub only if the
  // client didn't send a profile id (for very old clients).
  let voteUserId: string;
  if (clientProfileId) {
    voteUserId = clientProfileId;
  } else {
    voteUserId = sub;
  }

  try {
    // 1. Check if this user has already voted (by profile id OR by Cognito sub for backwards compatibility)
    const [votesByProfile, votesBySub] = await Promise.all([
      docClient.send(
        new ScanCommand({
          TableName: SNIPE_VOTE_TABLE,
          FilterExpression: "snipeId = :s AND userId = :u",
          ExpressionAttributeValues: { ":s": snipeId, ":u": voteUserId },
          Limit: 1,
        }),
      ),
      voteUserId !== sub
        ? docClient.send(
            new ScanCommand({
              TableName: SNIPE_VOTE_TABLE,
              FilterExpression: "snipeId = :s AND userId = :sub",
              ExpressionAttributeValues: { ":s": snipeId, ":sub": sub },
              Limit: 1,
            }),
          )
        : { Items: [] },
    ]);

    // If we found a legacy vote stored under the Cognito sub but none under the
    // UserProfile id, migrate it so the frontend's profile-id-based lookup works.
    if (
      clientProfileId &&
      (votesByProfile.Items?.length ?? 0) === 0 &&
      (votesBySub.Items?.length ?? 0) > 0
    ) {
      const legacyVote = votesBySub.Items![0] as { id: string };
      await docClient.send(
        new UpdateCommand({
          TableName: SNIPE_VOTE_TABLE,
          Key: { id: legacyVote.id },
          UpdateExpression: "SET userId = :u",
          ExpressionAttributeValues: { ":u": voteUserId },
        }),
      );
    }

    const alreadyVoted =
      (votesByProfile.Items?.length ?? 0) > 0 ||
      (votesBySub.Items?.length ?? 0) > 0;
    if (alreadyVoted) {
      throw new Error("You have already voted on this snipe");
    }

    // 2. Record the user's vote (always use voteUserId so future lookups by profile id find it)
    const nowForVote = new Date().toISOString();
    await docClient.send(
      new PutCommand({
        TableName: SNIPE_VOTE_TABLE,
        Item: {
          id: uuidv4(),
          snipeId,
          userId: voteUserId,
          value: delta,
          createdAt: nowForVote,
          updatedAt: nowForVote,
          __typename: "SnipeVote",
        },
        ConditionExpression: "attribute_not_exists(id)",
      }),
    );

    // 3. Fetch Snipe to get correct key (Amplify may use composite key owner+id for owner-auth models)
    const getSnipe = await docClient.send(
      new GetCommand({
        TableName: SNIPE_TABLE,
        Key: { id: snipeId },
      }),
    );
    let snipeItem = getSnipe.Item;
    let snipeKey: Record<string, string> = { id: snipeId };
    if (!snipeItem) {
      const scanSnipe = await docClient.send(
        new ScanCommand({
          TableName: SNIPE_TABLE,
          FilterExpression: "id = :id",
          ExpressionAttributeValues: { ":id": snipeId },
          Limit: 1,
        }),
      );
      snipeItem = scanSnipe.Items?.[0];
      if (snipeItem?.owner != null) {
        snipeKey = { id: snipeId, owner: String(snipeItem.owner) };
      }
    }
    if (!snipeItem) {
      throw new Error("Snipe not found");
    }

    const now = new Date().toISOString();
    const result = await docClient.send(
      new UpdateCommand({
        TableName: SNIPE_TABLE,
        Key: snipeKey,
        UpdateExpression:
          "SET #score = if_not_exists(#score, :zero) + :delta, #updatedAt = :now",
        ExpressionAttributeNames: {
          "#score": "score",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":delta": delta,
          ":zero": 0,
          ":now": now,
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    const updated = result.Attributes;
    if (!updated) {
      throw new Error("Snipe not found");
    }

    return {
      id: updated.id,
      sniperId: updated.sniperId,
      targetId: updated.targetId,
      imageKey: updated.imageKey,
      caption: updated.caption ?? null,
      score: updated.score ?? 0,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      __typename: "Snipe",
    };
  } catch (error) {
    console.error("Error in updateSnipeScore handler:", error);
    throw error;
  }
};

