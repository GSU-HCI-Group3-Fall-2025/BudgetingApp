import { router } from 'expo-router';

export const useNavigation = () => {
  return {
    goToLogin: () => router.push('/Login'),
    goToSignUp: () => router.push('/SignUp'),
    goToDashboard: (params: any) => router.push({ pathname: '/Dashboard' , params: params }),
    goToInvalidLogin: () => router.push('/InvalidLogin'),
    goToResetPassword: () => router.push('/ResetPassword'),
    goToAccountSettings: (params: any) => router.push({ pathname: '/AccountSettings', params: params }),
    goBack: () => {
        router.back();
    },
  };
};
