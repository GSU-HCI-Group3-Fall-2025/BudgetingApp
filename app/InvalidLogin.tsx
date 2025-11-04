// InvalidLogin.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from './hooks/useNavigation';

export default function InvalidLogin({  }) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Invalid Login Credentials</Text>
      <Text style={styles.subText}>Please check your email and password and try again.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => useNavigation().goToLogin()}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e48d8dff',
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});