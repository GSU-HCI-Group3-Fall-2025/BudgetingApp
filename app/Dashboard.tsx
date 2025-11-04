import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Budgets from './Budgets';
import Expenses from './Expenses';
import { useNavigation } from './hooks/useNavigation';
import Reports from './Reports';

export default function Dashboard() {
  const [income, setIncome] = useState(0);
  const [spending, setSpending] = useState(0);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [editingIncome, setEditingIncome] = useState(false);

  const [user, setUser] = useState({
    name: 'Test User',
    email: 'testuser@gmail.com',
    password: 'pass123',
  });

  const remainingBudget = income - spending;

  return (
    <View style={styles.container}>
      {/* Account Settings Button */}
      <View style={styles.topRow}>
        <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => useNavigation().goToAccountSettings({ user })}
        >
            <Text style={styles.settingsText}>⚙️</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => useNavigation().goToLogin()}
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
              {editingIncome ? (
                <TextInput
                  style={styles.inputBox}
                  keyboardType="numeric"
                  value={income.toString()}
                  onChangeText={(text) => setIncome(Number(text))}
                  onBlur={() => setEditingIncome(false)}
                  autoFocus
                />
              ) : (
                <View style={styles.valueRow}>
                  <Text style={styles.infoValue}>${income.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditingIncome(true)}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
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

        {activeTab === 'Budgets' && <Budgets />}
        {activeTab === 'Expenses' && <Expenses onTotalChange={setSpending} />}
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
  inputBox: { width: '60%', backgroundColor: '#E0F2F1', padding: 8, borderRadius: 8, textAlign: 'center', fontSize: 18 },
  valueRow: { flexDirection: 'row', alignItems: 'center' },
  editButton: { backgroundColor: '#43A047', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginLeft: 10 },
  editText: { color: '#000', fontWeight: '600' },
  remainingText: { marginTop: 15, fontWeight: '600', fontSize: 16, color: '#2E7D32' },
});