import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerHandler } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: PostConfirmationTriggerHandler = async (event) => {
    const { income, savingsGoal } = event.request.clientMetadata || {};
    
    console.log('Creating user profile for:', event.request.userAttributes.sub);
    
    try {
        const tableName = await findUserProfileTable();
        
        const item = {
            id: event.request.userAttributes.sub,
            email: event.request.userAttributes.email,
            income: income ? parseFloat(income) : 0,
            savingsGoal: savingsGoal ? parseFloat(savingsGoal) : 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: item
        }));
        
        console.log('Successfully created user profile');
    } catch (error) {
        console.error('Error creating user profile:', error);
    }
    
    return event;
};

async function findUserProfileTable(): Promise<string> {
    try {
        const command = new ListTablesCommand({});
        const response = await client.send(command);
        
        // Filter for UserProfile tables that match the pattern
        const userProfileTables = response.TableNames?.filter(tableName => 
            tableName.startsWith('UserProfile-') && 
            tableName.endsWith('-NONE')
        ) || [];
        
        if (userProfileTables.length === 0) {
            throw new Error('No UserProfile tables found');
        }
        
        // If multiple tables, you might want to check which one is active
        // For now, return the first one
        console.log('Found UserProfile tables:', userProfileTables);
        return userProfileTables[0];
        
    } catch (error) {
        console.error('Error listing tables:', error);
        throw error;
    }
}
