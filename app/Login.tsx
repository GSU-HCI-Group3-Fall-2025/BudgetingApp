import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuthenticator } from './hooks/useAuthenticator';
import { useNavigation } from './hooks/useNavigation';
import { User } from './SignUp';
import { handleAuth } from './utils/AuthUtils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigator = useNavigation();
  
  const handleLogin = async () => {
     try {
        const user: User = {email: email, pword: password, income: "0", savingsGoal: "0"};
        const response = await useAuthenticator().signIn(user);
        handleAuth(response, user);
    } catch (error) {
        //console.log("Error", error)
        navigator.goToInvalidLogin({errorMessage: (error as any).toString()});
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💰 Budget Buddy 💰</Text>
      <Text style={styles.title}>LOGIN</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email here:"
        placeholderTextColor="#000"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Enter your password here:"
          placeholderTextColor="#000"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(prev => !prev)}
        >
          <Text style={styles.eyeText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigator.goToSignUp()}>
        <Text style={styles.link}>
          Don't have an account? Click here to Create an Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigator.goToResetPassword()}>
        <Text style={styles.link}>
          Forgot Password? Click here to Reset your Password.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F5E9',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 30,
  },
  input: {
    padding: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    backgroundColor: '#fff',
    minWidth: 250,
    maxWidth: 400,
    width: '100%',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  eyeText: {
    fontSize: 14,
    color: '#1B5E20',
  },
  button: {
    width: '25%',
    backgroundColor: '#43A047',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    marginTop: 15,
    fontSize: 15,
    color: '#388E3C',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});