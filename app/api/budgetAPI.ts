import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { BudgetData } from "../Expenses";
import { ValidationResult } from "../SignUp";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
    ...(process.env.NODE_ENV === 'development' && 
        process.env.AWS_ACCESS_KEY_ID && 
        process.env.AWS_SECRET_ACCESS_KEY && {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    })
});

const docClient = DynamoDBDocumentClient.from(client);

export const getIncome = async(userId: string) : Promise<number> => {
    const command = new GetCommand({
        TableName: "UserProfiles",
        Key: { userId }
    })

    const response = await docClient.send(command)
    const income = parseFloat(response.Item?.income)
    return income || 0
}

export const getSavings = async(userId: string) : Promise<number> => {
    const command = new GetCommand({
        TableName: "UserProfiles",
        Key: { userId }
    });

    const response = await docClient.send(command)
    const savingsGoal = parseFloat(response.Item?.savingsGoal)

    return savingsGoal || 0
}

export const updateIncome = async(userId: string, newIncome: number) : Promise<ValidationResult> => {
    const command = new UpdateCommand({
        TableName: "UserProfiles",
        Key: { userId },
        UpdateExpression: "SET income = :income",
        ExpressionAttributeValues: {
            ":income": newIncome
        }
    });

    var response;

    try {
        response = await docClient.send(command);
        console.log("Update Success Response", response);
        return {isValid: true, message: "Successful Income Update"};
    } catch (error) {
        console.error(error);
         console.log("Update Failure Response", response);
        return {isValid: false, message: "Could not update!"};
    }
}

export const getBudget = async (userId: string) : Promise<BudgetData> => {
    const command = new GetCommand({
        TableName: "UserProfiles",
        Key: { userId },
        ProjectionExpression: "variableBudgets, fixedBudgets",
    });
    
    try {
        const response = await docClient.send(command);
        if (response.Item) {
            return { variableBudgets: response.Item.variableBudgets || {}, fixedBudgets: response.Item.fixedBudgets || {} }
        } else {
            console.log("Item not found");
            return { variableBudgets : {}, fixedBudgets: {} }
        }
    } catch (error) {
        console.error("GetCommand Failed:", error);
        throw error;
    }
};

export const updateBudget = async (userId: string, data: BudgetData): Promise<boolean> => {
     var command;
     
     if (data.fixedBudgets && data.variableBudgets){
        command = new UpdateCommand({
            TableName: "UserProfiles",
            Key: { userId },
            UpdateExpression: "SET variableBudgets = :vb, fixedBudgets = :fb",
            ExpressionAttributeValues: {
                ":vb" : data.variableBudgets,
                ":fb": data.fixedBudgets,
            }
        });
     } else if (data.fixedBudgets) {
        command = new UpdateCommand({
            TableName: "UserProfiles",
            Key: { userId },
            UpdateExpression: "SET fixedBudgets = :fb",
            ExpressionAttributeValues: {
                ":fb": data.fixedBudgets,
            }
        });
     } else if (data.variableBudgets) {
       command = new UpdateCommand({
            TableName: "UserProfiles",
            Key: { userId },
            UpdateExpression: "SET variableBudgets = :vb",
            ExpressionAttributeValues: {
                ":vb" : data.variableBudgets,
            }
        });
     } else {
        return true;
     }

    try {
        const response = await docClient.send(command);
        console.log("UpdateCommand Success:", response);
        return true;
    } catch (error) {
        console.error("UpdateCommand Failed:", error);
        return false;
    }
};