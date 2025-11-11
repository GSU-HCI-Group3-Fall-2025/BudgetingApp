import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetResourcesCommand, ResourceGroupsTaggingAPIClient } from '@aws-sdk/client-resource-groups-tagging-api';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerHandler } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const taggingClient = new ResourceGroupsTaggingAPIClient({});

let cachedTableName: string | null = null;

async function findUserProfileTable(): Promise<string> {
    if (cachedTableName) {
        return cachedTableName;
    }
    
    try {
        // Get the app-id from the Lambda function's environment
        const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME || '';
        const appId = 'd3fgew73asr4zf'; // Your correct app ID
        
        console.log('Looking for UserProfile table for app-id:', appId);
        
        // Find table by Amplify app-id tag
        const command = new GetResourcesCommand({
            ResourceTypeFilters: ['dynamodb:table'],
            TagFilters: [
                {
                    Key: 'amplify:app-id',
                    Values: [appId]
                }
            ]
        });
        
        const response = await taggingClient.send(command);
        
        // Find the UserProfile table for this specific app
        const userProfileTable = response.ResourceTagMappingList?.find(resource => 
            resource.ResourceARN?.includes('UserProfile-') && 
            resource.ResourceARN?.includes('-NONE')
        );
        
        if (userProfileTable?.ResourceARN) {
            const tableName = userProfileTable.ResourceARN.split('/').pop() || '';
            console.log('Found correct UserProfile table:', tableName);
            cachedTableName = tableName;
            return tableName;
        }
        
        throw new Error(`No UserProfile table found for Amplify app: ${appId}`);
        
    } catch (error) {
        console.error('Error finding UserProfile table:', error);
        throw error;
    }
}

export const handler: PostConfirmationTriggerHandler = async (event) => {
    const { income, savingsGoal, firstName, lastName } = event.request.clientMetadata || {};
    
    console.log('Creating user profile for:', event.request.userAttributes.sub);
    
    try {
        const tableName = await findUserProfileTable();
        
        const item = {
            id: event.request.userAttributes.sub,
            email: event.request.userAttributes.email,
            firstName: firstName || '',
            lastName: lastName || '',
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