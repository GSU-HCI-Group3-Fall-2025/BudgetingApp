import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from './hooks/useNavigation';

export interface User {
    firstName?: string
    lastName?: string
    email: string
    pword: string
    income?: number
    savingsGoal?: number
}

export default function SignUp() {
    const [user, setUser] = useState<User>({
        firstName: "",
        lastName: "",
        email: "",
        pword: "",
        income: 0,
        savingsGoal: 0,
    })
    const [confirmPassword, setConfirmPassword] = useState<string>("")

  const handleSignUp = () => {
    // Basic validation

    if (!user.firstName || !user.lastName || !user.email || !user.pword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (user.pword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Sign up success → redirect to login
    try {
        //Sign Up FLOW
    } catch (error: any) {
        Alert.alert("Error", error.message)
    }
    Alert.alert('Sign Up Successful', `Welcome, ${user.firstName}!`, [
      {
        text: 'OK',
        onPress: () => useNavigation().goToLogin(),
      },
    ]);
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
        onChangeText={(firstName) => setUser(prevUser => ({...prevUser, firstName: firstName}))}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#666"
        value={user.lastName}
        onChangeText={(lastName) => setUser(prevUser => ({...prevUser, lastName: lastName}))}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={user.email}
        onChangeText={(email) => setUser(prevUser => ({...prevUser, email: email}))}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={user.pword}
        onChangeText={(pword) => setUser(prevUser => ({...prevUser, pword: pword}))}
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
        value={user.income?.toString() || ""}
        onChangeText={(income) => setUser(prevUser => ({...prevUser, income: parseFloat(income) || 0}))}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Savings Goal (Optional)"
        placeholderTextColor="#666"
        value={user.savingsGoal?.toString() || ""}
        onChangeText={(savings) => setUser(prevUser => ({...prevUser, savings: parseFloat(savings) || 0}))}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => useNavigation().goToLogin()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  link: { marginTop: 20, fontSize: 18, color: '#388E3C', textDecorationLine: 'underline' },
});