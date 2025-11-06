import { Amplify } from "aws-amplify";
import { confirmResetPassword, ConfirmResetPasswordInput, confirmSignIn, ConfirmSignInInput, ConfirmSignInOutput, confirmSignUp, ConfirmSignUpInput, ConfirmSignUpOutput, resetPassword, ResetPasswordOutput, signIn, SignInOutput, signOut, signUp, SignUpOutput } from 'aws-amplify/auth';
import { User } from "../SignUp";

import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);

export const useAuthenticator = () => {
    
    return {
        signOut: async () => {
            return signOut();
        },
        signIn: async (user: User): Promise<SignInOutput> => {
            return await signIn({
                username: user.email,
                password: user.pword,
            });
        },
        signUp: async (user: User): Promise<SignUpOutput> => {
            console.log(user);
            return await signUp({
                username: user.email,
                password: user.pword,
                options: {
                    userAttributes: {
                        email: user.email,
                        given_name: user.firstName,
                        family_name: user.lastName,
                    },
                    autoSignIn: {
                        enabled: true
                    },
                    clientMetadata: {
                        income: user.income?.toString() || "0",
                        savingsGoal: user.savingsGoal?.toString() || "0",
                    }
                }
            })
        },
        confirmSignIn: async (input: ConfirmSignInInput) : Promise<ConfirmSignInOutput> => {
            return await confirmSignIn(input)
        },
        confirmSignUp: async (input: ConfirmSignUpInput) : Promise<ConfirmSignUpOutput> => {
            return await confirmSignUp(input)
        },
        confirmResetPassword: async (input: ConfirmResetPasswordInput ) : Promise<void> => {
            return await confirmResetPassword(input);
        },
        resetPassword: async (email: string): Promise<ResetPasswordOutput> => {
            return await resetPassword({
                username: email
            })
        }
    }
}
