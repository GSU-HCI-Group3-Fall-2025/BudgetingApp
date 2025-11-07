import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { BudgetData } from "../Expenses";
import { ValidationResult } from "../SignUp";

const client = generateClient<Schema>();

export const getIncome = async(userId: string): Promise<number> => {
    try {
        const response = await client.models.UserProfile.get({ id: userId });
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
        
        return {
            variableBudgets: data?.variableBudgets as { [key: string]: number } || {},
            fixedBudgets: data?.fixedBudgets as { [key: string]: number } || {}
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
            updateData.variableBudgets = data.variableBudgets;
        }
        if (data.fixedBudgets) {
            updateData.fixedBudgets = data.fixedBudgets;
        }
        
        await client.models.UserProfile.update(updateData);
        return true;
    } catch (error) {
        console.error("Failed to update budget:", error);
        return false;
    }
};
