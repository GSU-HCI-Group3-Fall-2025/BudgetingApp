// ResetPassword.js
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from './hooks/useNavigation';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (e: string) => {
    // Email regex
    return /\S+@\S+\.\S+/.test(e);
  };

  const handleSendReset = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Replace URL with backend endpoint
      const res = await fetch('http://localhost:4000/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (res.ok) {
        // navigate to confirmation screen (or show alert)
        //TODO: create ResetConfirmation screen
        //useNavigation().goToResetConfirmation({ email });
      } else {
        Alert.alert('Error', json.message || 'Unable to send reset email.');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Network Error', 'Could not reach the server. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.info}>Enter your account email and we’ll send a reset link.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleSendReset} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>SEND RESET LINK</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => useNavigation().goBack()}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9' },
  title: { fontSize: 28, fontWeight: '700', color: '#2E7D32', marginBottom: 8 },
  info: { textAlign: 'center', marginBottom: 20, color: '#2E7D32' },
  input: { width: '85%', padding: 12, borderWidth: 1, borderColor: '#999', borderRadius: 8, backgroundColor: '#fff', marginBottom: 16 },
  button: { width: '70%', padding: 14, borderRadius: 10, backgroundColor: '#43A047', alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  link: { color: '#388E3C', marginTop: 8, textDecorationLine: 'underline' },
});