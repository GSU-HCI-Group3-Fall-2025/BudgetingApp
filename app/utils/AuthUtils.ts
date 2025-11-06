import { ConfirmSignInOutput, ConfirmSignUpOutput, SignInOutput, SignUpOutput, autoSignIn, resendSignUpCode } from '@aws-amplify/auth';
import { getCurrentUser } from "aws-amplify/auth";
import { ConfirmType } from '../Confirm';
import { useNavigation } from "../hooks/useNavigation";
import { User } from '../SignUp';

let storedClientMetadata: Record<string, string> | null = null;
export const setClientMetadata = (metadata: Record<string, string>) => {
  storedClientMetadata = metadata;
};

export const getClientMetadata = () => storedClientMetadata;
export const clearClientMetadata = () => {
  storedClientMetadata = null;
};

const handleSignInNextStep = (response: SignInOutput, user: User) => {
    //console.log("NextStep on SignIn", response.nextStep.signInStep);
    const navigator = useNavigation();
    
    try {
        switch(response.nextStep.signInStep) {
            case "DONE":
                clearClientMetadata();
                navigator.goToDashboard({ user: JSON.stringify(user) });
                break;
            case "CONFIRM_SIGN_UP":
                const type: ConfirmType = ConfirmType.SIGN_UP_CODE;
                navigator.goToConfirm({ type: type, username: user.email });
                break;
            case "RESET_PASSWORD":
                break;
            case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
                navigator.goToConfirm({ type: ConfirmType.NEW_PASSWORD_REQUIRED });
                break;
            case "CONTINUE_SIGN_IN_WITH_EMAIL_SETUP":
            case "CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION":
            case "CONFIRM_SIGN_IN_WITH_PASSWORD":
            case "CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION":
            case "CONTINUE_SIGN_IN_WITH_TOTP_SETUP":
            case "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE":
            case "CONTINUE_SIGN_IN_WITH_MFA_SELECTION":
            case "CONFIRM_SIGN_IN_WITH_SMS_CODE":
            case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
            case "CONFIRM_SIGN_IN_WITH_EMAIL_CODE":
                throw new Error(`Unsupported sign-in method: ${response.nextStep.signInStep}`);
            default:
                throw new Error(`Unknown sign-in step: ${response.nextStep}`);
        }
    } catch (error) {
        console.error("Error in handleSignInNextStep:", error);
        throw error;
    }
}

const handleRegisterNextStep = async (response: SignUpOutput, user: User) => {
    const navigator = useNavigation();
    //console.log("NextStep on SignIn", response.nextStep.signUpStep);
    switch(response.nextStep.signUpStep) {
        case "DONE":
            navigator.goToDashboard({ user: JSON.stringify(user) });
            break;
        case "CONFIRM_SIGN_UP":
            navigator.goToConfirm({ type: ConfirmType.SIGN_UP_CODE, username: user.email })
            break;
        case "COMPLETE_AUTO_SIGN_IN":
            const response = await autoSignIn();
            handleAuth(response, user);
        default:
            break;
    }
}

export const checkIsAuthenticated = async() => {
    try {
        await getCurrentUser();
        return true;
    } catch (error: any) {
        if (error.name === 'UserUnAuthenticatedException') {
            return false;
        }
        console.log(error)
    }
    return false;
}

const resendCode = async (username: string) => {
    try {
        await resendSignUpCode({ username });
        console.log('Verification code resent');
    } catch (error) {
        console.error('Error resending code:', error);
    }
};

export const handleAuth = (response: SignInOutput | SignUpOutput | ConfirmSignInOutput | ConfirmSignUpOutput, user: User) => {
    if (isResponseType(response, isSignUpType)) {
        handleRegisterNextStep(response, user);
    } else if (isResponseType(response, isSignInType)) {
        handleSignInNextStep(response, user);
    } else {
        throw new Error("Unforeseen Error")
    }
}


type SignInOutputTypes = SignInOutput | ConfirmSignInOutput;
type SignUpOutputTypes = SignUpOutput | ConfirmSignUpOutput;

const isSignUpType = (res: any): res is SignUpOutputTypes => 'userId' in res || 'isSignUpComplete' in res;
const isSignInType = (res: any): res is SignInOutputTypes => 'isSignedIn' in res

const isResponseType = <T>(response: any, typeCheck: (res: any) => res is T): response is T => {
    return typeCheck(response);
}



