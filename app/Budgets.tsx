import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getBudget, updateBudget as saveBudget } from './api/budgetAPI';

const categories: string[] = [];

interface Budget {
    title: string;
    amount: number;
}

// Predetermined fixed monthly expenses
const fixedExpenses = [
    { category: 'Rent/Mortgage', amount: 800 },
    { category: 'Gas', amount: 150 },
    { category: 'Utilities', amount: 120 },
];

interface BudgetsProps {
    userId: string;
    income: number;
    expenses: number;
    onBudgetChange: any;
}

export default function Budgets({ userId, income, expenses, onBudgetChange }: BudgetsProps) {
    const [budgets, setBudgets] = useState<Budget[]>(categories.map(cat => ({ title: cat, amount: 0 })));
    const [advice, setAdvice] = useState<string>("");
    const [budgetData, setBudgetData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    const updateBudget = (index: number, text: string) => {
        // Allows typing of decimals but ultimately stores a number
        const numericText = text.replace(/[^0-9.]/g, ''); 
        const amount = parseFloat(numericText) || 0;

        const updated = [...budgets];
        updated[index].amount = amount;
        setBudgets(updated);
    };

    useEffect(() => {
        const loadBudget = async () => {
            try {
                const budget = await getBudget(userId);
                //console.log("budget", budget);
                setBudgetData(budget);
                
                // Update budgets with data from DB, default to 0
                const updatedBudgets = Object.entries(budget.variableBudgets || {}).map(([title, amount]) => ({
                    title: title,
                    amount: amount
                }));
                setBudgets(updatedBudgets);
            } catch (error) {
                console.error("Failed to load budget data:", error);
            }
        };
        loadBudget();
    }, [userId]);

    // Use fixed budgets from DB or defaults
    const fixedBudgetsFromDB = budgetData.fixedBudgets || {};
    const displayFixedExpenses = fixedExpenses.map(expense => ({
        ...expense,
        amount: fixedBudgetsFromDB[expense.category] || expense.amount
    }));

    const handleSaveBudget = async () => {
        if (isSaving) return;

        setIsSaving(true);
        
        // 1. Prepare data structure for the backend
        const variableBudgets: { [key: string]: number } = {};
        budgets.forEach(b => {
            variableBudgets[b.title] = b.amount;
        });

        const fixedBudgets: { [key: string]: number } = {};
        displayFixedExpenses.forEach(f => {
             fixedBudgets[f.category] = f.amount;
        });

        const budgetDataToSave = {
            variableBudgets,
            fixedBudgets, // Include fixed budgets if your API needs them for completeness
        };

        try {
            const success = await saveBudget(userId, budgetDataToSave); 
            
            if (success) {
                Alert.alert("Success", "Your budgets have been saved successfully!");
            } else {
                Alert.alert("Error", "Failed to save budget. Please try again.");
            }
        } catch (error) {
            console.error("Budget save error:", error);
            Alert.alert("Error", "An unexpected error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    // Compute advice whenever budgets or income change
    useEffect(() => {
        var newAdvice: string = "";

        const totalFixed = displayFixedExpenses.reduce((sum, f) => sum + f.amount, 0);
        const totalVariableBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
        const totalBudgeted = totalFixed + totalVariableBudgeted;
        onBudgetChange(totalBudgeted)

        const remainingToBudget = income - totalBudgeted;

        // --- Advice Rule 1: Budget Exceeded/Remaining ---
        if (totalBudgeted > income) {
            newAdvice = ("🚨 **Caution**: Your total budgets exceed your monthly income!");
        } else if (remainingToBudget > 0) {
            newAdvice = (`✅ **Great job!** You have $${remainingToBudget.toFixed(2)} remaining to budget. Consider putting this into savings.`);
        }

        // --- Advice Rule 2: High Variable Spending Warning (e.g., above 35% of income) ---
        const maxVariableBudget = income * 0.35; 
        if (totalVariableBudgeted > maxVariableBudget && income > 0) {
            newAdvice = (`⚠️ **Warning**: Your total variable budget ($${totalVariableBudgeted.toFixed(2)}) is over 35% of your income.`);
        }

        // --- Advice Rule 3: Individual Category Warning (e.g., above 15% of income) ---
        budgets.forEach(b => {
            if (b.amount > income * 0.15 && income > 0) {
                newAdvice = (`High Spend: ${b.title} budget ($${b.amount.toFixed(2)}) is over 15% of your total income.`);
            }
        });

        setAdvice(newAdvice);
    }, [budgets, income, displayFixedExpenses]);

    return (
        <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.title}>Monthly Budgets</Text>

            {/* Fixed Expenses */}
            <Text style={styles.sectionTitle}>Fixed Budgets</Text>
            {displayFixedExpenses.map((f) => (
                <View key={f.category} style={styles.budgetItem}>
                    <Text style={styles.category}>{f.category}</Text>
                    <Text style={styles.fixedAmount}>${f.amount.toFixed(2)}</Text>
                </View>
            ))}

            {/* User Budget Categories */}
            <Text style={styles.sectionTitle}>Variable Budgets</Text>
            <FlatList
                data={budgets}
                keyExtractor={(item) => item.title}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                    <View style={styles.budgetItem}>
                        <Text style={styles.category}>{item.title}</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={item.amount.toString()}
                            onChangeText={(text) => updateBudget(index, text)}
                            placeholder="Enter budget"
                        />
                    </View>
                )}
            />

            {/* Advice Section */}
            {advice.length > 0 && (
                <View style={styles.adviceBox}>
                    <Text style={styles.adviceHeader}>Budgeting Advice</Text>
        
                        <Text style={styles.adviceText}>• {advice}</Text>
                </View>
            )}

            <TouchableOpacity 
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveBudget}
                disabled={isSaving}
            >
                <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save Budgets'}
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 22, fontWeight: 'bold', marginVertical: 10, color: '#2E7D32' },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 15, marginBottom: 5, color: '#1B5E20' },
    budgetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5, backgroundColor: '#fff', padding: 12, borderRadius: 8, width: '85%' },
    category: { fontSize: 16, color: '#2E7D32' },
    input: { backgroundColor: '#E0F2F1', padding: 8, borderRadius: 8, width: 100, textAlign: 'center', fontSize: 16 },
    fixedAmount: { fontSize: 16, fontWeight: '600', color: '#1B5E20' },
    adviceBox: { marginTop: 15, backgroundColor: '#FFECB3', padding: 10, borderRadius: 8, width: '85%', borderColor: '#BF360C', borderWidth: 1 },
    adviceHeader: { fontSize: 16, fontWeight: '700', color: '#BF360C', marginBottom: 5 },
    adviceText: { color: '#BF360C', fontWeight: '500', marginVertical: 2 },
    saveButton: {
        width: '85%',
        backgroundColor: '#1B5E20',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    saveButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});