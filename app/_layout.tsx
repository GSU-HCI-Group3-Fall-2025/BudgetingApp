import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack initialRouteName="Login" screenOptions={{headerShown: false}}>
            <Stack.Screen name="Login" />
            <Stack.Screen name="SignUp" />
            <Stack.Screen name="Dashboard" />
        </Stack>
  );
}
