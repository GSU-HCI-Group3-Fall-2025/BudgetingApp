import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Challenge } from "../Challenges";
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

export const getBudgets = async (userId: string): Promise<BudgetData> => {
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
            console.log("Fixed Budgets", data.fixedBudgets)
            updateData.fixedBudgets = JSON.stringify(data.fixedBudgets);
        }
        
        const resp = await client.models.UserProfile.update(updateData);
        if (resp.errors) {
            console.error("Errors in response:", resp.errors);
            return false;
        }
        console.log("Update", resp)
        return true;
    } catch (error: any) {
        // If update fails because record doesn't exist, create it
        console.error("Failed to update budget:", error);
        return false;
    }
};

export const getProfile = async (userId: string): Promise<Schema["UserProfile"]["type"]> => {
    try {
        const response = await client.models.UserProfile.get({ id: userId });
        console.log("Profile Response", response);
        if (response.data) {
            return response.data;
        } else {
            throw new Error("User profile not found");
        }
    } catch (error) {
        console.error("Failed to get profile:", error);
        throw error;
    }
}


export const updateProfile = async (userId: string, firstName: string, lastName: string): Promise<boolean> => {
    try {        
        const resp = await client.models.UserProfile.update({
            id: userId,
            firstName: firstName,
            lastName: lastName,
        });
        console.log("Update Profile", resp)
        return true;
    } catch (error: any) {
        console.error("Failed to update profile:", error);
        return false;
    }
}

export const updateChallenges = async(userId: string, joinedChallenges: Challenge[]): Promise<boolean> => {
    try {
        const updateData: any = { id: userId };
        updateData.joinedChallenges = JSON.stringify(joinedChallenges);
        
        const resp = await client.models.UserProfile.update(updateData);
        if (resp.errors) {
            console.error("Errors in response:", resp.errors);
            return false;
        }
        console.log("Update Challenges", resp)
    } catch (error: any) {
        console.error("Failed to update challenges:", error);
        return false;
    }

    return true;
}

export const getChallenges = async(userId: string): Promise<Challenge[]> => {
    try {
        const response = await client.models.UserProfile.get({ id: userId });
        const data = response.data;
        
        if (data?.joinedChallenges) {
            console.log("Challenges found for user");
            try {
                const challenges = typeof data.joinedChallenges === 'string' ? JSON.parse(data.joinedChallenges) : data.joinedChallenges;
                return challenges;
            } catch {
                return [];
            }
        } else {
            console.log("No challenges found for user");
            return [];
        }
    } catch (error) {
        console.error("Failed to get challenges:", error);
        return [];
    }
}