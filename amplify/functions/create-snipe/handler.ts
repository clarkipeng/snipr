import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    ScanCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  const { targetId, imageKey, caption } = event.arguments;
  const sub = event.identity?.sub || event.identity?.claims?.sub;

  const SNIPE_TABLE = process.env.SNIPE_TABLE_NAME!;
  const MESSAGE_TABLE = process.env.MESSAGE_TABLE_NAME!;
  const GROUP_MEMBER_TABLE = process.env.GROUP_MEMBER_TABLE_NAME!;
  const USER_PROFILE_TABLE = process.env.USER_PROFILE_TABLE_NAME!;

  try {
    // 1. Resolve sniper ID from UserProfile using Cognito sub via owner field
    const ownerValue = `${sub}::${sub}`;
    const userScan = await docClient.send(
      new ScanCommand({
        TableName: USER_PROFILE_TABLE,
        FilterExpression: "#owner = :owner",
        ExpressionAttributeNames: { "#owner": "owner" },
        ExpressionAttributeValues: { ":owner": ownerValue },
      }),
    );

    const sniper = userScan.Items?.[0];
    if (!sniper) throw new Error("Sniper profile not found");
    const sniperId = sniper.id;

    // 2. Find shared groups between sniper and target
    const [sniperGroupsScan, targetGroupsScan] = await Promise.all([
      docClient.send(
        new ScanCommand({
          TableName: GROUP_MEMBER_TABLE,
          FilterExpression: "userId = :userId",
          ExpressionAttributeValues: { ":userId": sniperId },
        }),
      ),
      docClient.send(
        new ScanCommand({
          TableName: GROUP_MEMBER_TABLE,
          FilterExpression: "userId = :userId",
          ExpressionAttributeValues: { ":userId": targetId },
        }),
      ),
    ]);

    const sniperGroupIds = new Set(
      sniperGroupsScan.Items?.map((i: Record<string, any>) => i.groupId),
    );
    const sharedGroupIds =
      targetGroupsScan.Items?.map((i: Record<string, any>) => i.groupId).filter(
        (id: string) => sniperGroupIds.has(id),
      ) || [];

    // 3. Atomic transaction: create the Snipe and all Messages in one operation
    const snipeId = uuidv4();
    const now = new Date().toISOString();

    const transactItems: any[] = [
      {
        Put: {
          TableName: SNIPE_TABLE,
          Item: {
            id: snipeId,
            sniperId,
            targetId,
            imageKey,
            caption,
            score: 0,
            owner: sub,
            createdAt: now,
            updatedAt: now,
            __typename: "Snipe",
          },
        },
      },
    ];

    for (const groupId of sharedGroupIds) {
      transactItems.push({
        Put: {
          TableName: MESSAGE_TABLE,
          Item: {
            id: uuidv4(),
            groupId,
            senderId: sniperId,
            snipeId,
            content: caption || "",
            isSystemMessage: false,
            owner: sub,
            createdAt: now,
            updatedAt: now,
            __typename: "Message",
          },
        },
      });
    }

    await docClient.send(
      new TransactWriteCommand({ TransactItems: transactItems }),
    );

    // 4. Send push notification to target if they have an Expo push token
    try {
      const [targetRes, sniperRes] = await Promise.all([
        docClient.send(
          new GetCommand({
            TableName: USER_PROFILE_TABLE,
            Key: { id: targetId },
          }),
        ),
        docClient.send(
          new GetCommand({
            TableName: USER_PROFILE_TABLE,
            Key: { id: sniperId },
          }),
        ),
      ]);
      const target = targetRes.Item;
      const sniperName = sniperRes.Item?.name ?? "Someone";
      const expoPushToken = target?.expoPushToken;
      if (
        expoPushToken &&
        typeof expoPushToken === "string" &&
        expoPushToken.startsWith("ExponentPushToken")
      ) {
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            to: expoPushToken,
            sound: "default",
            title: "You got sniped!",
            body: caption?.trim()
              ? `${sniperName}: ${caption}`
              : `${sniperName} sniped you`,
            data: { type: "snipe", snipeId },
          }),
        });
      }
    } catch (pushErr) {
      console.error("Push notification failed (non-fatal):", pushErr);
    }

    return {
      id: snipeId,
      sniperId,
      targetId,
      imageKey,
      caption,
      score: 0,
      createdAt: now,
      updatedAt: now,
      __typename: "Snipe",
    };
  } catch (error) {
    console.error("Error in createSnipe handler:", error);
    throw error;
  }
};
