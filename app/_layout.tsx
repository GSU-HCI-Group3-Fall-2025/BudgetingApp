import { Amplify } from 'aws-amplify';
import { Stack } from 'expo-router';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

export default function RootLayout() {
    return (
        <Stack initialRouteName="Login" screenOptions={{headerShown: false}}>
            <Stack.Screen name="Login" />
            <Stack.Screen name="SignUp" />
            <Stack.Screen name="Dashboard" />
        </Stack>
  );
}
