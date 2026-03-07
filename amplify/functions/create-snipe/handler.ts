import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
    const { targetId, imageKey, caption } = event.arguments;
    const { sub, email } = event.identity.claims;

    const SNIPE_TABLE = process.env.SNIPE_TABLE_NAME!;
    const MESSAGE_TABLE = process.env.MESSAGE_TABLE_NAME!;
    const GROUP_MEMBER_TABLE = process.env.GROUP_MEMBER_TABLE_NAME!;
    const USER_PROFILE_TABLE = process.env.USER_PROFILE_TABLE_NAME!;

    try {
        // 1. Resolve sniper ID from UserProfile using email
        const userScan = await docClient.send(new ScanCommand({
            TableName: USER_PROFILE_TABLE,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        }));

        const sniper = userScan.Items?.[0];
        if (!sniper) throw new Error('Sniper profile not found');
        const sniperId = sniper.id;

        // 2. Create the Snipe record
        const snipeId = uuidv4();
        const now = new Date().toISOString();

        await docClient.send(new PutCommand({
            TableName: SNIPE_TABLE,
            Item: {
                id: snipeId,
                sniperId,
                targetId,
                imageKey,
                caption,
                owner: sub,
                createdAt: now,
                updatedAt: now,
                __typename: 'Snipe'
            }
        }));

        // 3. Find shared groups
        // Fetch all group memberships for both users
        const sniperGroupsScan = await docClient.send(new ScanCommand({
            TableName: GROUP_MEMBER_TABLE,
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId': sniperId }
        }));
        const targetGroupsScan = await docClient.send(new ScanCommand({
            TableName: GROUP_MEMBER_TABLE,
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId': targetId }
        }));

        const sniperGroupIds = new Set(sniperGroupsScan.Items?.map(i => i.groupId));
        const sharedGroupIds = targetGroupsScan.Items
            ?.map(i => i.groupId)
            .filter(id => sniperGroupIds.has(id)) || [];

        // 4. Create message records in shared groups
        for (const groupId of sharedGroupIds) {
            await docClient.send(new PutCommand({
                TableName: MESSAGE_TABLE,
                Item: {
                    id: uuidv4(),
                    groupId,
                    senderId: sniperId,
                    snipeId,
                    content: caption || '',
                    isSystemMessage: false,
                    owner: sub,
                    createdAt: now,
                    updatedAt: now,
                    __typename: 'Message'
                }
            }));
        }

        // Return the created snipe
        return {
            id: snipeId,
            sniperId,
            targetId,
            imageKey,
            caption,
            createdAt: now,
            updatedAt: now,
            __typename: 'Snipe'
        };

    } catch (error) {
        console.error('Error in createSnipe handler:', error);
        throw error;
    }
};
