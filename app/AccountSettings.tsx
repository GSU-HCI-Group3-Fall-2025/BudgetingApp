import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { getProfile, updateProfile } from "./api/budgetAPI";
import { useNavigation } from './hooks/useNavigation';

export default function AccountSettings() {    
  const route = useRoute();

  const params = (route.params ?? {}) as { userId?: string };
  const userId = params.userId ?? "";
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
  });

  const navigator = useNavigation();

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const profile = await getProfile(userId);
        setUser({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
        });
      } catch (error) {
        console.error("Failed to fetch user names:", error);
      }
    };

    fetchUserNames();
  }, [userId]);

  const handleSave = () => {
    //console.log('Saved user info:', user);
    updateProfile(userId, user.firstName, user.lastName);
    alert('Changes saved!');
    navigator.goToDashboard({ user: JSON.stringify(user) });
  };

    const handleCancel = () => {
        navigator.goToDashboard({ user: JSON.stringify(user) });
    }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      {/* First Name */}
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={user.firstName}
        onChangeText={(text) => setUser({ ...user, firstName: text })}
      />

    {/* Last Name */}
      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={user.lastName}
        onChangeText={(text) => setUser({ ...user, lastName: text })}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: '#E8F5E9', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2E7D32', 
    marginBottom: 20 
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#2E7D32', 
    alignSelf: 'flex-start', 
    marginTop: 15 
  },
  input: { 
    width: '100%', 
    padding: 10, 
    borderRadius: 8, 
    backgroundColor: '#fff', 
    marginTop: 5 
  },
  saveButton: { 
    marginTop: 20, 
    backgroundColor: '#43A047', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 8 
  },
  cancelButton: { 
    marginTop: 20, 
    backgroundColor: '#cb2323ff', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 8 
  },
  saveButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#000' 
  },
  cancelButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#fff' 
  },
});