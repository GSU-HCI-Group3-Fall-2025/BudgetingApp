import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerHandler } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: PostConfirmationTriggerHandler = async (event) => {
    const { income, savingsGoal } = event.request.clientMetadata || {};
    
    console.log('Creating user profile for:', event.request.userAttributes.sub);
    console.log('Environment variables:', JSON.stringify(process.env, null, 2));
    
    try {
        // Check multiple possible sources for table name
        let tableName = process.env.USER_PROFILE_TABLE_NAME || 
                       process.env.STORAGE_USERPROFILE_NAME ||
                       process.env.API_GRAPHQLAPIENDPOINTOUTPUT ||
                       process.env.AMPLIFY_USERPROFILE_TABLE;
        
        console.log('Table name from env vars:', tableName);
        
        // If no environment variable, fall back to hardcoded for now
        if (!tableName) {
            console.log('No table name in environment variables, using fallback');
            tableName = 'UserProfile-5xomtkw2ffgsvfwmfffso3p53i-NONE'; // Use the one with matching app ID
        }
        
        console.log('Final table name:', tableName);
        
        if (!tableName) {
            throw new Error('Table name is still null after all attempts');
        }
        
        const item = {
            id: event.request.userAttributes.sub,
            email: event.request.userAttributes.email,
            createdAt: new Date().toISOString(),
            ...(income && { income: parseFloat(income) }),
            ...(savingsGoal && { savingsGoal: parseFloat(savingsGoal) })
        };
        
        console.log('Putting item:', JSON.stringify(item, null, 2));
        
        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: item
        }));
        
        console.log('Successfully created user profile');
        return event;
        
    } catch (error) {
        console.error('Error creating user profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
    }
};