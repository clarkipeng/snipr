import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USER_PROFILE_TABLE = process.env.USER_PROFILE_TABLE_NAME!;

export const handler = async (event: any) => {
  const { query } = event.arguments;
  const q = (query ?? '').trim().toLowerCase();

  if (!q) {
    return { users: [] };
  }

  try {
    const scanResult = await docClient.send(
      new ScanCommand({
        TableName: USER_PROFILE_TABLE,
      })
    );

    const items = scanResult.Items ?? [];
    const filtered = items.filter((item: Record<string, unknown>) => {
      const name = String(item.name ?? '').toLowerCase();
      const email = String(item.email ?? '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });

    const users = filtered.map((item: Record<string, unknown>) => ({
      id: String(item.id),
      name: String(item.name ?? ''),
      email: String(item.email ?? ''),
      profilePicture: item.profilePicture != null ? String(item.profilePicture) : null,
    }));

    return { users };
  } catch (error) {
    console.error('Error in searchUsers handler:', error);
    throw error;
  }
};
