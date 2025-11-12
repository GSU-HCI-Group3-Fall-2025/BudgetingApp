import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getBudgets, updateBudget as saveBudget } from './api/budgetAPI';

const categories: Set<String> = new Set(['Rent/Mortgage', 'Transport', 'Utilities', 'Groceries', 'Entertainment', 'Dining', 'Shopping',  'Healthcare', 'Subscriptions']);

interface Budget {
    title: string;
    amount: number;
}

interface BudgetsProps {
    userId: string;
    income: number;
    onBudgetChange: any;
}

export default function Budgets({ userId, income, onBudgetChange }: BudgetsProps) {
    const [fixedBudgets, setFixedBudgets] = useState<Budget[]>( Array.from(categories, cat => ({ title: cat as string, amount: 0 })));
    const [variableBudgets, setVariableBudgets] = useState<Budget[]>([]);
    const [advice, setAdvice] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    const updateBudget = (index: number, text: string) => {
        // Allows typing of decimals but ultimately stores a number
        const numericText = text.replace(/[^0-9.]/g, ''); 
        const amount = parseFloat(numericText) || 0;

        const updated = [...fixedBudgets];
        updated[index].amount = amount;
        setFixedBudgets(updated);
    };

    useEffect(() => {
        const loadBudget = async () => {
            try {
                const budgets = await getBudgets(userId);
                //console.log("budget", budgets);

                //List through fixedBudgets and if fetchedBudgets has it, add amount, else 0
                //console.log("Budgets from API", fixedBudgets);
                const fixedBudgetsToSet = fixedBudgets.map(f => ({
                    title: f.title,
                    amount: budgets.fixedBudgets && budgets.fixedBudgets[f.title] ? budgets.fixedBudgets[f.title] : 0,
                }));

                // Update budgets with data from DB, default to 0
                const variableBudgetsToSet = Object.entries(budgets.variableBudgets || {}).map(([title, amount]) => ({
                    title: title,
                    amount: amount,
                }));

                //console.log("Fixed Budgets to Set", fixedBudgetsToSet);
                setFixedBudgets(fixedBudgetsToSet);
                setVariableBudgets(variableBudgetsToSet);
            } catch (error) {
                console.error("Failed to load budget data:", error);
            }
        };
        loadBudget();
    }, [userId]);

    const handleSaveFixedBudget = async () => {
        if (isSaving) return;

        setIsSaving(true);
    
        // 1. Prepare data structure for the backend
        const fixedBudgetsToSave: { [key: string]: number } = {};
        fixedBudgets.forEach(f => {
             fixedBudgetsToSave[f.title] = f.amount;
        });

        const budgetDataToSave = {
            fixedBudgets: fixedBudgetsToSave, // Include fixed budgets if your API needs them for completeness
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

        const totalFixed = fixedBudgets.reduce((sum, f) => sum + f.amount, 0);
        const totalVariableBudgeted = variableBudgets.reduce((sum, b) => sum + b.amount, 0);
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
        fixedBudgets.forEach(b => {
            if (b.amount > income * 0.15 && income > 0) {
                newAdvice = (`High Spend: ${b.title} budget ($${b.amount.toFixed(2)}) is over 15% of your total income.`);
            }
        });

        setAdvice(newAdvice);
    }, [fixedBudgets, income, variableBudgets]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Monthly Budgets</Text>

            {/* Fixed Expenses */}
            <Text style={styles.sectionTitle}>Fixed Budgets</Text>
            <FlatList
                data={fixedBudgets}
                keyExtractor={(item) => item.title}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                    <View key={item.title} style={styles.budgetItem}>
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

            {/* User Expenses Category */}
            <Text style={styles.sectionTitle}>Variable Budgets</Text>
            <FlatList
                data={variableBudgets}
                keyExtractor={(item) => item.title}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.budgetItem}>
                        <Text style={styles.category}>{item.title}</Text>
                        <Text style={styles.fixedAmount}>${item.amount.toFixed(2)}</Text>
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
                onPress={handleSaveFixedBudget}
                disabled={isSaving}
            >
                <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save Fixed Budgets'}
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#E8F5E9' },
    title: { fontSize: 22, fontWeight: 'bold', marginVertical: 10, color: '#2E7D32' },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 15, marginBottom: 5, color: '#1B5E20', alignSelf: 'center' },
    budgetItem: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', marginVertical: 5, backgroundColor: '#fff', padding: 12, borderRadius: 8, width: '85%' },
    category: { fontSize: 16, color: '#2E7D32' },
    input: { backgroundColor: '#E0F2F1', padding: 8, borderRadius: 8, width: 100, textAlign: 'center', fontSize: 16 },
    fixedAmount: { fontSize: 16, fontWeight: '600', color: '#1B5E20' },
    adviceBox: { alignSelf: 'center', marginTop: 15, backgroundColor: '#FFECB3', padding: 10, borderRadius: 8, width: '85%', borderColor: '#BF360C', borderWidth: 1 },
    adviceHeader: { fontSize: 16, fontWeight: '700', color: '#BF360C', marginBottom: 5 },
    adviceText: { color: '#BF360C', fontWeight: '500', marginVertical: 2 },
    saveButton: {
        alignSelf: 'center',
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