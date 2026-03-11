import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SNIPE_TABLE = process.env.SNIPE_TABLE_NAME!;
const SNIPE_VOTE_TABLE = process.env.SNIPE_VOTE_TABLE_NAME!;

export const handler = async (event: any) => {
  const { snipeId, delta } = event.arguments as {
    snipeId: string;
    delta: number;
  };
  const sub = event.identity?.sub || event.identity?.claims?.sub;

  if (typeof delta !== "number" || !Number.isFinite(delta)) {
    throw new Error("Invalid delta");
  }
  if (!sub) {
    throw new Error("Unauthenticated");
  }

  try {
    // 1. Check if this user has already voted on this snipe
    const existingVotes = await docClient.send(
      new ScanCommand({
        TableName: SNIPE_VOTE_TABLE,
        FilterExpression: "snipeId = :s AND userId = :u",
        ExpressionAttributeValues: {
          ":s": snipeId,
          ":u": sub,
        },
        Limit: 1,
      }),
    );

    if ((existingVotes.Items?.length ?? 0) > 0) {
      throw new Error("You have already voted on this snipe");
    }

    // 2. Record the user's vote
    await docClient.send(
      new PutCommand({
        TableName: SNIPE_VOTE_TABLE,
        Item: {
          id: uuidv4(),
          snipeId,
          userId: sub,
          value: delta,
          createdAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(id)",
      }),
    );

    // 3. Increment the snipe's score atomically
    const result = await docClient.send(
      new UpdateCommand({
        TableName: SNIPE_TABLE,
        Key: { id: snipeId },
        UpdateExpression: "SET #score = if_not_exists(#score, :zero) + :delta",
        ExpressionAttributeNames: { "#score": "score" },
        ExpressionAttributeValues: {
          ":delta": delta,
          ":zero": 0,
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

