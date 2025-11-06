import { router } from 'expo-router';
import { ConfirmType } from '../Confirm';

export const useNavigation = () => {
  return {
    goToLogin: () => router.push('/Login'),
    goToSignUp: () => router.push('/SignUp'),
    goToDashboard: (params: any) => router.push({ pathname: '/Dashboard' , params: params }),
    goToInvalidLogin: (params: {errorMessage?: string}) => router.push({pathname: '/InvalidLogin', params: params}),
    goToResetPassword: () => router.push('/ResetPassword'),
    goToAccountSettings: (params: any) => router.push({ pathname: '/AccountSettings', params: params }),
    goToConfirm: (params: { type: ConfirmType; username?: string}) => router.replace({pathname: '/Confirm', params: params}),
    goBack: () => {
        router.back();
    },
  };
};
