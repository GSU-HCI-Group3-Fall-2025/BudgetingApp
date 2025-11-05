import { confirmSignIn, confirmSignUp } from 'aws-amplify/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { handleSignInNextStep } from './utils/AuthUtils';

export enum ConfirmType {
    NEW_PASSWORD_REQUIRED,
    SIGN_UP_CODE,
    OTHER,
}

export default function Confirm(type: ConfirmType, username?: string) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleConfirm = async () => {
    try {
        var response;
        switch(type) {
            case ConfirmType.NEW_PASSWORD_REQUIRED:
                response = await confirmSignIn({ challengeResponse: newPassword });
                handleSignInNextStep(response);
                return;
            case ConfirmType.SIGN_UP_CODE:
                response = await confirmSignUp({ username: username || "", confirmationCode: code });
                break;
            default:
                await confirmSignIn({ challengeResponse: code });
        }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === ConfirmType.NEW_PASSWORD_REQUIRED ? 'Set New Password' : 'Enter Verification Code'}
      </Text>

      {type === ConfirmType.NEW_PASSWORD_REQUIRED ? (
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Enter verification code"
          keyboardType="numeric"
          value={code}
          onChangeText={setCode}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginBottom: 20, borderRadius: 8 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
