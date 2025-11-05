import { Amplify } from "aws-amplify";
import { signIn, SignInOutput, signOut } from 'aws-amplify/auth';
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
        }
    }
}
