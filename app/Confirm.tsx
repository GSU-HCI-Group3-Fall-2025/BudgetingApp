import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthenticator } from './hooks/useAuthenticator';
import { useNavigation } from './hooks/useNavigation';
import { getClientMetadata, handleAuth } from './utils/AuthUtils';

export enum ConfirmType {
    NEW_PASSWORD_REQUIRED = "NEWPASS",
    SIGN_UP_CODE = "SIGNUP",
    RESET_PASSWORD = "RESET_PASSWORD",
    OTHER = "OTHER",
}

export default function Confirm() {
  const route = useRoute();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { type, username }: { type?: ConfirmType, username?: string } = route.params || {};

  const authenticator = useAuthenticator();
  const navigator = useNavigation();

  const handleConfirm = async (confirmType: ConfirmType) => {
    try {
        var response;
        switch(confirmType) {
            case ConfirmType.NEW_PASSWORD_REQUIRED:
                response = await authenticator.confirmSignIn({ challengeResponse: newPassword });
                //console.log("Password");
                handleAuth(response, {email: username || "", pword: newPassword, income: "0", savingsGoal: "0"});
                break;
            case ConfirmType.SIGN_UP_CODE:
                //console.log("Verification Code", code);
                response = await authenticator.confirmSignUp({ username: username || "", confirmationCode: code, options: { clientMetadata: getClientMetadata() || {}} });
                handleAuth(response, {email: username || "", pword: newPassword, income: "0", savingsGoal: "0"});
                break;
            case ConfirmType.RESET_PASSWORD:
                response = await authenticator.confirmResetPassword({
                    username: username || "",
                    confirmationCode: code,
                    newPassword: newPassword,
                });
                Alert.alert(
                    'Success!', 
                    "Password Reset Successfully!",
                    [{ text: 'OK' }],
                    { cancelable: false });
                navigator.goToLogin();
                break;
             default:
                //console.log("Going to default case");
                response = authenticator.confirmSignIn({ challengeResponse: code });
                break;
        }
        //console.log("Confirm response", response);
    } catch (error: any) {
        Alert.alert('Error', error.message);
    }
};

  const getConfirmTitle = (type: ConfirmType) => {
  switch(type) {
    case ConfirmType.NEW_PASSWORD_REQUIRED:
      return "New Password";
    case ConfirmType.SIGN_UP_CODE:
      return "Enter Verification Code";
    case ConfirmType.RESET_PASSWORD:
      return "Reset Password";
    default:
      return "Confirm";
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {getConfirmTitle(type || ConfirmType.OTHER)}
      </Text>

      {(() => {
        switch(type) {
          case ConfirmType.NEW_PASSWORD_REQUIRED:
            return (
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            );
          
          case ConfirmType.SIGN_UP_CODE:
            return (
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                keyboardType="numeric"
                value={code}
                onChangeText={setCode}
              />
            );
          
          case ConfirmType.RESET_PASSWORD:
            return (
              <>
              <TextInput
                  style={styles.input}
                  placeholder="Enter verification code"
                  keyboardType="numeric"
                  value={code}
                  onChangeText={setCode}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </>
            );
          
          case ConfirmType.OTHER:
          default:
            return null;
        }
      })()}

      <TouchableOpacity style={styles.button} onPress={() => handleConfirm(type || ConfirmType.OTHER)}>
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
