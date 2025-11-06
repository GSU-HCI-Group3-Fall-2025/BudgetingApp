import React, { JSX, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getBudget, updateBudget } from './api/budgetAPI';

// Predetermined fixed expenses

export interface BudgetData {
    variableBudgets?: { [key: string]: number };
    fixedBudgets?: { [key: string]: number };
}

interface Expense {
    key: string;
    title: string;
    amount: number;
}

export default function Expenses({userId}: {userId: string}) {
  const[expenses, setExpenses] = useState<Expense[]>([]);
  const [tempAmount, setTempAmount] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const[isSaving, setIsSaving] = useState<boolean>(false);

useEffect(() => {
    const loadBudget = async() => {
        try {
            const budget = await getBudget(userId);
            const variableBudgets = budget.variableBudgets || {};
            
            const newExpenses = Object.entries(variableBudgets).map(([title, amount], index) => ({
                key: `${title}_${index}`,
                title: title,
                amount: Number(amount) || 0
            }));

            setExpenses(newExpenses);
        } catch(error) {
            console.error("Failed to get Budgets", error);
        }
    }
    loadBudget();
}, [userId]);

  const addExpense = () => {
    if (!newTitle || !tempAmount) {
      Alert.alert('Error', 'Please enter title, amount, and date.');
      return;
    }

    if (expenses.some(expense => expense.title === newTitle)) {
        Alert.alert('Error', 'Record already exists');
        return;
    }

    const amount = parseFloat(tempAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Amount must be a positive number.');
      return;
    }

    const newExpenses = expenses;
    newExpenses.push({key: `${newTitle}_${expenses.length}` , title: newTitle , amount: amount });
    setExpenses(newExpenses);
    setNewTitle('');
    setTempAmount('');
  };

  const startEdit = (item: Expense) => {
    setNewTitle(item.title);
    setTempAmount(item.amount.toString());
  };

  const handleToggle = async  (item: Expense) => {
    if (isEditing) {
        if (isSaving) return;

        setIsSaving(true);
        try {
            await saveSingleEdit(item.title);
        } catch (error) {
            console.error("Error during budget save: ", error);
            Alert.alert("Error", "Failed to Save Expense, Please Try again.")
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    } else {
        setIsEditing(true);
        startEdit(item)
    }
  }

  const saveSingleEdit = async (title: string) => {
    const editAmount = parseFloat(tempAmount);
    if (isNaN(editAmount) || editAmount < 0) {
      Alert.alert('Error', 'Amount must be a positive number.');
      return;
    }

    const idx = expenses.findIndex(expense => expense.title === title)
    expenses[idx] = {...expenses[idx], amount: editAmount};
    setTempAmount('');
    setNewTitle('');
  };

  const deleteExpense = (id : string) => {
    setIsEditing(false);
    const newExpenses = expenses.filter(expense => expense.key !== id);
    setExpenses(newExpenses);
  };

  const updateVariableBudget = async () => {
    const variableBudgets: { [key: string]: number } = expenses.reduce((acc: { [key: string]: number }, item) => {
        acc[item.title] = item.amount;
        return acc;
    }, {});

    try {
        const success = await updateBudget(userId, { variableBudgets: variableBudgets })
        if (success) {
            Alert.alert("Success", "Your budgets have been saved successfully!");
        } else {
            Alert.alert("Error", "Failed to save budget. Please try again.");
        }
    } catch(error) {
          console.error("Budget save error:", error);
          Alert.alert("Error", "An unexpected error occurred while saving.");
    }
  }

  const renderExpenseItem = (item: Expense): JSX.Element => (
    <View style={styles.expenseItem}>
        <Text style={styles.expenseTitle}>{item.title} - ${item.amount.toFixed(2)}</Text>
        <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleToggle(item)}><Text style={styles.editText}>{isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExpense(item.key)}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
        </View>
    </View>
  );

  return (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={styles.title}>Expenses</Text>
  
    <Text style={styles.sectionTitle}>Additional Expenses</Text>

    <View style={styles.itemList}>
        <FlatList
        data={expenses}
        contentContainerStyle={{ alignItems: 'center' }}
        keyExtractor={(item) => item.key}
        renderItem={(object) => renderExpenseItem(object.item)}
        />
    </View>

    <View style={styles.inputContainer}>
      <TextInput style={styles.input} placeholder="Title" value={newTitle} onChangeText={setNewTitle} />
      <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={tempAmount} onChangeText={setTempAmount} />
      <TouchableOpacity style={styles.addButton} onPress={addExpense}>
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={updateVariableBudget}>
        <Text style={styles.addButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);

}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1B5E20', marginTop: 10, marginBottom: 5 },
  expenseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5, backgroundColor: '#fff', padding: 10, borderRadius: 8, width: '95%' },
  expenseTitle: { fontSize: 16, flex: 1 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginVertical: 5, width: '105%' },
  addButton: { backgroundColor: '#43A047', padding: 12, borderRadius: 12, marginTop: 10, alignItems: 'center', width: '85%' },
  addButtonText: { color: '#fff', fontWeight: '600' },
  editButton: { backgroundColor: '#43A047', padding: 6, borderRadius: 6, marginRight: 5 },
  editText: { color: '#fff', fontWeight: '600' },
  deleteButton: { backgroundColor: '#E53935', padding: 6, borderRadius: 6, marginRight: 5 },
  deleteText: { color: '#fff', fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '600' },
  saveButton: { width: '85%', backgroundColor: '#1B5E20', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  itemList : { paddingBottom: 15, flex: 1, width: "100%"},
  inputContainer: {width: '100%', alignItems: 'center',paddingTop: 10},
});