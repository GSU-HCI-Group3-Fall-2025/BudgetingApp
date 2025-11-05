import { SignInOutput } from '@aws-amplify/auth';
import { getCurrentUser } from "aws-amplify/auth";
import { Alert } from 'react-native';
import { ConfirmType } from '../Confirm';
import { useNavigation } from "../hooks/useNavigation";

export const handleSignInNextStep = (response: SignInOutput) => {

    const fakeUser = {
        email: 'test@gmail.com',
        password: 'pass123',
        name: 'Test User',
    };

    console.log("NextStep on SignIn", response.nextStep.signInStep);
    switch(response.nextStep.signInStep) {
        case "DONE":
            useNavigation().goToDashboard({ user: JSON.stringify(fakeUser) });
        case "CONTINUE_SIGN_IN_WITH_EMAIL_SETUP" :
            break;
        case "CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION" :
            break;
        case "CONFIRM_SIGN_IN_WITH_PASSWORD" :
            break;
        case"CONFIRM_SIGN_UP" :
            break;
        case "RESET_PASSWORD" :
            break;
        case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
            useNavigation().goToConfirm({ type: ConfirmType.NEW_PASSWORD_REQUIRED })
            break;
        case "CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION" :
        case "CONTINUE_SIGN_IN_WITH_TOTP_SETUP" :
        case "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE":
        case "CONTINUE_SIGN_IN_WITH_MFA_SELECTION":
        case "CONFIRM_SIGN_IN_WITH_SMS_CODE":
        case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
        case "CONFIRM_SIGN_IN_WITH_EMAIL_CODE" :
            Alert.alert(response.nextStep.signInStep)
            console.log("Unsupported Method");
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