import { generateClient } from "aws-amplify/data";
import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import type { Schema } from "../../data/resource";

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
 const { income, savingsGoal } = event.request.clientMetadata || {};
    console.log('Client metadata:', event.request.clientMetadata);
    console.log('User profile:', event.request.userAttributes.sub, income, savingsGoal);
    
    console.log('Saving user profile:', event.request.userAttributes.sub);
    await client.models.UserProfile.create({
        id: event.request.userAttributes.sub,
        email: event.request.userAttributes.email,
        income: income ? parseFloat(income) : 0,
        savingsGoal: savingsGoal ? parseFloat(savingsGoal) : 0,
    });
    
    return event;
};