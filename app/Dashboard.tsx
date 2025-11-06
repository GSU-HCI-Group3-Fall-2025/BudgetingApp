import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getIncome, updateIncome } from './api/budgetAPI';
import Budgets from './Budgets';
import Expenses from './Expenses';
import { useAuthenticator } from './hooks/useAuthenticator';
import { useNavigation } from './hooks/useNavigation';
import Reports from './Reports';
import { checkIsAuthenticated } from './utils/AuthUtils';

export default function Dashboard() {
  const [user, setUser] = useState({
    email: '',
    userId: ""
  });

  const [income, setIncome] = useState(0);
  const [spending, setSpending] = useState(0);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [editingIncome, setEditingIncome] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigator = useNavigation();
  const authenticator = useAuthenticator();

    useEffect(() => {
        checkAuthState();
    }, []);
  
    const checkAuthState = async () => {
        const isAuth = await checkIsAuthenticated();
        if (!isAuth) {
            router.replace("/Login");
        } else {
            try {
            const newUser = await authenticator.getUser();
            setUser({...user, userId: newUser.userId})
            const income = await getIncome(newUser.userId);
            setIncome(income)
            } catch (error) {
                console.error(error);
            }
        }
    };
  
    const { signOut } = useAuthenticator(); 
    const handleLogout = () => {
        signOut();
        navigator.goToLogin();
    }

    const handleSave = async () => {
        const response = await updateIncome(user.userId, income)
        if (!response.isValid) {
            Alert.alert(
                'Validation Error', 
                response.message,
                [{ text: 'OK' }],
                { cancelable: false }
            );
            return;
        }

        Alert.alert(
            "Successful Update",
            response.message,
            [{ text: 'OK' }],
            { cancelable: false }
        );
    }

    const handleToggle = async () => {
    // If the button says 'Save'
    if (editingIncome) {
        if (isSaving) return; // Guard against rapid clicks

        setIsSaving(true);
        
        try {
            await handleSave();
        } catch (error) {
            console.error("Error during income save:", error);
            Alert.alert("Error", "Failed to save income. Please try again.");
        } finally {
            // End saving, stop editing
            setIsSaving(false);
            setEditingIncome(false);
        }
    } else {
        // If the button says 'Edit', start editing
        console.log("Start Editing");
        setEditingIncome(true);
    }
};

  const remainingBudget = income - spending;

  return (
    <View style={styles.container}>
      {/* Account Settings Button */}
      <View style={styles.topRow}>
        <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigator.goToAccountSettings({ user })}
        >
            <Text style={styles.settingsText}>⚙️</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
        >
            <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
    </View>

      {/* Title */}
      <Text style={styles.logo}>💰 Budget Buddy 💰</Text>
      <Text style={styles.pageTitle}>{activeTab}</Text>
      <Text style={styles.pageDescription}>
        {{
          Dashboard: 'Welcome! Track your monthly income and spending.',
          Budgets: 'Set monthly budgets and get advice on spending.',
          Expenses: 'Add, edit, or delete your expenses.',
          Reports: 'View your monthly reports with graphs and tips.',
        }[activeTab]}
      </Text>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['Dashboard', 'Budgets', 'Expenses', 'Reports'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentBox}>
        {activeTab === 'Dashboard' && (
          <View style={styles.dashboardContent}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Total Monthly Income</Text>
              <View style={styles.valueRow}>
             {editingIncome ? (
                <TextInput
                    style={styles.inputBox}
                    keyboardType="numeric"
                    value={income.toString()}
                    onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9.]/g, '');
                        const newIncome = numericText ? Number(numericText) : 0;
                        setIncome(newIncome);
                    }}
                    autoFocus
                />
              ) : (
                <View style={styles.valueRow}>
                  <Text style={styles.infoValue}>${income.toFixed(2)}</Text>
                </View>
              )}

             <TouchableOpacity
                style={[
                    styles.editButton,
                    // Apply a disabled style when saving
                    isSaving && styles.editButtonDisabled 
                ]}
                onPress={handleToggle}
                disabled={isSaving} // Disable when a save operation is in progress
              >
                <Text style={[styles.editText, isSaving && styles.editTextSaving]}>
                    {isSaving ? 'Saving...' : editingIncome ? 'Save' : 'Edit'}
                </Text>
            </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Monthly Spending</Text>
              <Text style={styles.infoValue}>${spending.toFixed(2)}</Text>
            </View>

            <Text style={styles.remainingText}>
              Remaining Budget: ${remainingBudget.toFixed(2)}
            </Text>
          </View>
        )}

        {activeTab === 'Budgets' && <Budgets userId={user.userId} income={income} expenses={0} onBudgetChange={setSpending}/>}
        {activeTab === 'Expenses' && <Expenses userId={user.userId} />}
        {activeTab === 'Reports' && <Reports />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E8F5E9' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: "12%"},
  logo: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginVertical: 10 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginVertical: 5 },
  pageDescription: { fontSize: 16, color: '#1B5E20', textAlign: 'center', marginBottom: 15, paddingHorizontal: 10 },

  logoutButton: { position: 'absolute', top: 40, right: 20, backgroundColor: '#E53935', padding: 8, borderRadius: 8, zIndex: 10 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  settingsButton: { position: 'absolute', top: 40, left: 20, padding: 8, backgroundColor: '#A5D6A7', borderRadius: 8, zIndex: 10 },
  settingsText: { fontSize: 18 },

  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#A5D6A7' },
  activeTab: { backgroundColor: '#43A047' },
  tabText: { fontWeight: '600', color: '#1B5E20' },
  activeTabText: { color: '#fff' },

  contentBox: { flexGrow: 1, backgroundColor: '#C8E6C9', borderRadius: 12, padding: 15, alignItems: 'center', justifyContent: 'flex-start' },

  dashboardContent: { width: '100%', alignItems: 'center' },
  infoBox: { width: '70%', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  infoLabel: { fontSize: 16, fontWeight: '600', color: '#2E7D32', marginBottom: 10 },
  infoValue: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },
  inputBox: { width: '60%', backgroundColor: '#E0F2F1', padding: 8, borderRadius: 8, textAlign: 'center', fontSize: 18, },
  valueRow: { flexDirection: 'row', alignItems: 'center' },
  editButton: { backgroundColor: '#43A047', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginLeft: 10 },
  editText: { color: '#000', fontWeight: '600' },
  remainingText: { marginTop: 15, fontWeight: '600', fontSize: 16, color: '#2E7D32' },
  // Add these to your StyleSheet.create({})
    editButtonDisabled: { 
    backgroundColor: '#90A4AE', // Gray color for disabled state
    },
    editTextSaving: {
    color: '#E0E0E0', // Lighter text color while saving
    },
});