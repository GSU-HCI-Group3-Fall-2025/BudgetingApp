import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getChallenges, updateChallenges } from './api/budgetAPI';

export interface Challenge {
    id: number;
    title: string;
}

export default function Challenges({userId}: {userId: string}) {
  const [joinedChallenges, setJoinedChallenges] = useState<Challenge[]>([]);
  const [isSaving, setIsSaving] = useState(false);

   useEffect(() => {
        const loadBudget = async () => {
            try {
                console.log("Loading challenges for user");
                const challenges = await getChallenges(userId);
            //   const updatedChallenges = Object.entries(challenges || []).map(([title, challenge]) => ({
            //         id: challenge.id,
            //         title: challenge.title
            //   }));
                setJoinedChallenges(challenges);
            } catch (error) {
                console.error("Failed to load budget data:", error);
            }
        };
        loadBudget();
    }, [userId]);

  // Sample savings challenges
  const challenges: Challenge[] = [
    { id: 1, title: 'Save $50 in a week' },
    { id: 2, title: 'No coffee shop spending for 3 days' },
    { id: 3, title: 'Save $100 in a month' },
    { id: 4, title: 'Track all spending for 7 days' },
    { id: 5, title: 'No take out for 5 days' }, // fixed duplicate id
  ];

  const handleChallenge = (challenge: Challenge) => {
    console.log("Current joined challenges:", joinedChallenges);
    if (!joinedChallenges.some(c => c.id === challenge.id)) {
        console.log("Joining challenge:", challenge);
      setJoinedChallenges([...joinedChallenges, challenge]);
    } else {
        console.log("Removing challenge:", challenge);
      setJoinedChallenges(joinedChallenges.filter(c => c.id !== challenge.id));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const success = await updateChallenges(userId, joinedChallenges);
        if (success) {
            console.log("Challenges updated successfully");
        } else {
            console.error("Failed to update challenges");
        }
    } catch (error) {
        console.error("Error updating challenges:", error);
    }
    setIsSaving(false);
  }

  return (
    <View style={styles.container}>
      {/* Notification Banner */}
      {joinedChallenges.length > 0 && (
        <View style={styles.notification}>
          {joinedChallenges.map((challenge) => {
            return <Text key={challenge.id} style={styles.notificationText}>Challenge started: "{challenge.title}"</Text>
          })}
        </View>
      )}

      <Text style={styles.title}>Savings Challenges</Text>
      <ScrollView contentContainerStyle={styles.challengeList}>
        {challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeBox}>
            <Text style={styles.challengeText}>{challenge.title}</Text>
            <TouchableOpacity
              style={[joinedChallenges.some(c => c.id === challenge.id) ? styles.removeButton : styles.joinButton]}
              onPress={() => handleChallenge(challenge)}
              disabled={isSaving}
            >
              <Text style={styles.joinText}>
                {joinedChallenges.some(c => c.id === challenge.id) ? 'Remove' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
            style={[styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
        >
            <Text style={styles.joinText}>
                {isSaving ? 'Saving...' : 'Save Budgets'}
            </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#E8F5E9', alignItems: 'center' },
  notification: { backgroundColor: '#A5D6A7', padding: 12, borderRadius: 10, marginBottom: 10 },
  notificationText: { color: '#1B5E20', fontSize: 18, textAlign: 'center', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#2E7D32', marginBottom: 12, textAlign: 'center' },
  challengeList: { paddingBottom: 20 },
  challengeBox: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  challengeText: { fontSize: 18, color: '#2E7D32', flex: 1, marginRight: 10 },
  joinButton: { backgroundColor: '#43A047', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  removeButton: { backgroundColor: '#E53935', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  joinText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  saveButton: { width: '85%', backgroundColor: '#1B5E20', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 10, },
});