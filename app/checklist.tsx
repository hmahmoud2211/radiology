import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useChecklistStore } from '@/store/checklistStore';
import { useAuthStore } from '../store/authStore';
import ChecklistItem from '@/components/checklist/ChecklistItem';
import Button from '@/components/shared/Button';

export default function ChecklistScreen() {
  const router = useRouter();
  const { patientId, studyId } = useLocalSearchParams();
  const { currentUser } = useAuthStore();
  const {
    currentChecklist,
    startChecklist,
    updateChecklistItem,
    completeChecklist,
    validateChecklist,
    isLoading,
    error,
  } = useChecklistStore();

  useEffect(() => {
    if (!currentChecklist && patientId && studyId) {
      startChecklist(patientId as string, studyId as string, currentUser?.id || '');
    }
  }, [patientId, studyId, currentChecklist]);

  const handleComplete = () => {
    if (!currentChecklist) return;

    const validationResult = validateChecklist(currentChecklist);
    if (!validationResult.isValid) {
      Alert.alert(
        'Cannot Complete Checklist',
        `Please address the following issues:\n${validationResult.errors.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Complete Checklist',
      'Are you sure you want to complete this checklist? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            completeChecklist(currentChecklist.id, currentUser?.id || '');
            router.back();
          },
        },
      ]
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!currentChecklist) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading checklist...</Text>
      </View>
    );
  }

  const completedItems = currentChecklist.items.filter(
    (item) => item.status === 'completed'
  ).length;
  const totalItems = currentChecklist.items.length;
  const progress = (completedItems / totalItems) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {completedItems} of {totalItems} items completed
            </Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
                progress === 100 ? styles.progressComplete : null,
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {currentChecklist.items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onUpdate={(updates) =>
              updateChecklistItem(currentChecklist.id, item.id, updates)
            }
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.startedInfo}>
          <Text style={styles.startedText}>
            Started by: {currentChecklist.startedBy}
          </Text>
          <Text style={styles.startedText}>
            At: {new Date(currentChecklist.startedAt).toLocaleString()}
          </Text>
        </View>

        <Button
          title="Complete Checklist"
          onPress={handleComplete}
          disabled={progress < 100}
          loading={isLoading}
          variant={progress === 100 ? 'primary' : 'outline'}
          icon={progress === 100 ? <CheckCircle2 size={20} color="white" /> : null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressComplete: {
    backgroundColor: Colors.success,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    backgroundColor: Colors.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startedInfo: {
    marginBottom: 16,
  },
  startedText: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
}); 