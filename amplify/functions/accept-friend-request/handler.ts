import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  const { requestId } = event.arguments;
  const sub = event.identity?.sub || event.identity?.claims?.sub;

  const FRIENDSHIP_TABLE = process.env.FRIENDSHIP_TABLE_NAME!;
  const FRIEND_REQUEST_TABLE = process.env.FRIEND_REQUEST_TABLE_NAME!;
  const USER_PROFILE_TABLE = process.env.USER_PROFILE_TABLE_NAME!;

  if (!requestId || !sub) {
    throw new Error('Missing requestId or user identity');
  }

  try {
    // 1. Get the friend request
    const getRequest = await docClient.send(
      new GetCommand({
        TableName: FRIEND_REQUEST_TABLE,
        Key: { id: requestId },
      })
    );

    const request = getRequest.Item;
    if (!request) {
      throw new Error('Friend request not found');
    }

    // 2. Resolve current user (receiver) profile ID using Cognito sub
    const ownerValue = `${sub}::${sub}`;
    const userScan = await docClient.send(
      new ScanCommand({
        TableName: USER_PROFILE_TABLE,
        FilterExpression: '#owner = :owner',
        ExpressionAttributeNames: { '#owner': 'owner' },
        ExpressionAttributeValues: { ':owner': ownerValue },
      })
    );

    const receiverProfile = userScan.Items?.[0];
    if (!receiverProfile) {
      throw new Error('User profile not found');
    }

    const receiverId = receiverProfile.id;
    if (request.receiverId !== receiverId) {
      throw new Error('Only the receiver can accept this request');
    }

    const senderId = request.senderId;
    const now = new Date().toISOString();

    // 3. Atomic transaction: create both friendships and delete the request
    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: FRIENDSHIP_TABLE,
              Item: {
                id: uuidv4(),
                userId: receiverId,
                friendId: senderId,
                __typename: 'Friendship',
                createdAt: now,
                updatedAt: now,
              },
            },
          },
          {
            Put: {
              TableName: FRIENDSHIP_TABLE,
              Item: {
                id: uuidv4(),
                userId: senderId,
                friendId: receiverId,
                __typename: 'Friendship',
                createdAt: now,
                updatedAt: now,
              },
            },
          },
          {
            Delete: {
              TableName: FRIEND_REQUEST_TABLE,
              Key: { id: requestId },
            },
          },
        ],
      })
    );

    return true;
  } catch (error) {
    console.error('Error in acceptFriendRequest handler:', error);
    throw error;
  }
};
