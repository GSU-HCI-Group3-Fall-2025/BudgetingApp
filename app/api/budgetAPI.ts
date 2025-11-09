import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { BudgetData } from "../Expenses";
import { ValidationResult } from "../SignUp";

const client = generateClient<Schema>();

export const getIncome = async(userId: string): Promise<number> => {
    try {
        const response = await client.models.UserProfile.get({ id: userId });
        console.log("Income Response", response)
        return response.data?.income || 0;
    } catch (error) {
        console.error("Failed to get income:", error);
        return 0;
    }
}

export const getSavings = async(userId: string): Promise<number> => {
    try {
        const response = await client.models.UserProfile.get({ id: userId });
        return response.data?.savingsGoal || 0;
    } catch (error) {
        console.error("Failed to get savings:", error);
        return 0;
    }
}

export const updateIncome = async(userId: string, newIncome: number): Promise<ValidationResult> => {
    try {
        await client.models.UserProfile.update({ 
            id: userId, 
            income: newIncome 
        });
        return { isValid: true, message: "Successful Income Update" };
    } catch (error) {
        console.error("Failed to update income:", error);
        return { isValid: false, message: "Could not update!" };
    }
}

export const getBudget = async (userId: string): Promise<BudgetData> => {
    try {
        const response = await client.models.UserProfile.get({ id: userId });
        const data = response.data;

        console.log("data", data);
        
        const parseJsonSafely = (jsonString: any) => {
            try {
                return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString || {};
            } catch {
                return {};
            }
        };
        
        return {
            variableBudgets: parseJsonSafely(data?.variableBudgets),
            fixedBudgets: parseJsonSafely(data?.fixedBudgets)
        };
    } catch (error) {
        console.error("Failed to get budget:", error);
        return { variableBudgets: {}, fixedBudgets: {} };
    }
};

export const updateBudget = async (userId: string, data: BudgetData): Promise<boolean> => {
    try {
        const updateData: any = { id: userId };
        
        if (data.variableBudgets) {
            console.log("Variable Budgets", data.variableBudgets)
            updateData.variableBudgets = JSON.stringify(data.variableBudgets);
        }
        if (data.fixedBudgets) {
            updateData.fixedBudgets = data.fixedBudgets;
        }
        
        const resp = await client.models.UserProfile.update(updateData);
        if (resp.errors) {
             try {
                const createData = {
                    id: userId,
                    income: 0,
                    savingsGoal: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    variableBudgets: data.variableBudgets ? JSON.stringify(data.variableBudgets) : undefined,
                    fixedBudgets: data.fixedBudgets || undefined
                };
                
                const createResp = await client.models.UserProfile.create(createData);
                console.log("Created", createResp);
                return true;
            } catch (createError) {
                console.error("Failed to create budget:", createError);
                return false;
            }
        }
        console.log("Update", resp)
        return true;
    } catch (error: any) {
        // If update fails because record doesn't exist, create it
        console.error("Failed to update budget:", error);
        return false;
    }
};
