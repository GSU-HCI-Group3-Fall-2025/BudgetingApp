import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuthenticator } from './hooks/useAuthenticator';
import { useNavigation } from './hooks/useNavigation';
import { handleAuth, setClientMetadata } from './utils/AuthUtils';

export interface User {
    firstName?: string;
    lastName?: string;
    email: string;
    pword: string;
    income: string;       // Keeping as string based on your component logic
    savingsGoal: string;  // Keeping as string based on your component logic
}

export interface ValidationResult {
    isValid: boolean;
    message: string;
}

const validateUser = (user: User, confirmPassword: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.firstName || user.firstName.trim().length === 0) {
        return { isValid: false, message: 'Please enter your first name.' };
    }

    if (!user.lastName || user.lastName.trim().length === 0) {
        return { isValid: false, message: 'Please enter your last name.' };
    }

    if (!user.email || !emailRegex.test(user.email)) {
        return { isValid: false, message: 'Please enter a valid email address.' };
    }

    if (!user.pword || user.pword.trim().length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }

    if (user.pword !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match.' };
    }

    return { isValid: true, message: 'Success' };
}

export default function SignUp() {
    const [user, setUser] = useState<User>({
        firstName: "",
        lastName: "",
        email: "",
        pword: "",
        income: "",
        savingsGoal: "",
    })
    const [confirmPassword, setConfirmPassword] = useState<string>("")

    const [isLoading, setIsLoading] = useState<boolean>(false) 
    
    const authenticator = useAuthenticator();
    const navigator = useNavigation();

    const handleSignUp = async () => {
        const validation = validateUser(user, confirmPassword);
        if (!validation.isValid) {
            Alert.alert(
                'Validation Error', 
                validation.message,
                [{ text: 'OK' }],
                { cancelable: false }
            );
            return;
        }

        setIsLoading(true);

        try {
            const metadata = {
                income: user.income,
                savingsGoal: user.savingsGoal
            };

            setClientMetadata(metadata);

            const response = await authenticator.signUp(user);
            handleAuth(response, user);
            
        } catch (error: any) {
            Alert.alert("Error", error.message);
            navigator.goToInvalidLogin({errorMessage: (error as any).toString()});
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.logo}>💰 Budget Buddy</Text>
    <Text style={styles.title}>Create an Account</Text>

    <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#666"
        value={user.firstName}
        onChangeText={(firstName) => setUser(prevUser => ({...prevUser, firstName}))}
    />

    <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#666"
        value={user.lastName}
        onChangeText={(lastName) => setUser(prevUser => ({...prevUser, lastName}))}
    />

    <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={user.email}
        onChangeText={(email) => setUser(prevUser => ({...prevUser, email}))}
        keyboardType="email-address"
        autoCapitalize="none"
    />

    <TextInput
        style={styles.input}
        placeholder="Password (Min 8 characters)"
        placeholderTextColor="#666"
        value={user.pword}
        onChangeText={(pword) => setUser(prevUser => ({...prevUser, pword}))}
        secureTextEntry
    />

    <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#666"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
    />

    <TextInput
        style={styles.input}
        placeholder="Monthly Income (Optional)"
        placeholderTextColor="#666"
        value={user.income}
        onChangeText={(income) => setUser(prevUser => ({...prevUser, income: income.replace(/[^0-9.]/g, '') }))} 
        keyboardType="numeric"
    />

    <TextInput
        style={styles.input}
        placeholder="Savings Goal (Optional)"
        placeholderTextColor="#666"
        value={user.savingsGoal}
        onChangeText={(savingsGoal) => setUser(prevUser => ({...prevUser, savingsGoal: savingsGoal.replace(/[^0-9.]/g, '')}))}
        keyboardType="numeric"
    />

    <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSignUp}
        disabled={isLoading} // Disable button when loading
    >
        <Text style={styles.buttonText}>{isLoading ? 'Signing Up...' : 'Sign Up'}</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigator.goToLogin()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- Updated Styles for Disabled Button ---
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#E8F5E9',
    },
    logo: { fontSize: 36, marginBottom: 10, fontWeight: 'bold', color: '#2E7D32' },
    title: { fontSize: 26, marginBottom: 20, fontWeight: '600', color: '#2E7D32' },
    input: {
        width: '90%',
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#A5D6A7',
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    button: {
        width: '90%',
        backgroundColor: '#43A047',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: { // New style for disabled state
        backgroundColor: '#A5D6A7', 
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    link: { marginTop: 20, fontSize: 18, color: '#388E3C', textDecorationLine: 'underline' },
});