import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SNIPE_TABLE = process.env.SNIPE_TABLE_NAME!;

export const handler = async (event: any) => {
  const { snipeId, delta } = event.arguments as {
    snipeId: string;
    delta: number;
  };

  if (typeof delta !== "number" || !Number.isFinite(delta)) {
    throw new Error("Invalid delta");
  }

  try {
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

