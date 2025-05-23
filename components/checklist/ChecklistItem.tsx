import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { CheckCircle2, AlertCircle, XCircle, HelpCircle, Paperclip } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ChecklistItem as ChecklistItemType } from '@/types';

type ChecklistItemProps = {
  item: ChecklistItemType;
  onUpdate: (updates: Partial<ChecklistItemType>) => void;
};

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showValueInput, setShowValueInput] = useState(false);
  const [value, setValue] = useState(item.value?.toString() || '');

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return Colors.success;
      case 'flagged':
        return Colors.error;
      case 'not_applicable':
        return Colors.mediumGray;
      default:
        return Colors.primary;
    }
  };

  const handleStatusChange = (newStatus: ChecklistItemType['status']) => {
    onUpdate({ status: newStatus });
  };

  const handleValueSubmit = () => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      onUpdate({ value: numValue });
    }
    setShowValueInput(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setShowDetails(!showDetails)}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.title}>{item.title}</Text>
          {item.isRequired && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {item.status === 'completed' && (
            <CheckCircle2 size={20} color={Colors.success} />
          )}
          {item.status === 'flagged' && (
            <AlertCircle size={20} color={Colors.error} />
          )}
          {item.status === 'not_applicable' && (
            <XCircle size={20} color={Colors.mediumGray} />
          )}
          {item.status === 'pending' && (
            <HelpCircle size={20} color={Colors.primary} />
          )}
        </View>
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.description}>{item.description}</Text>

          {item.status === 'completed' && item.verifiedBy && (
            <View style={styles.verificationInfo}>
              <Text style={styles.verificationText}>
                Verified by: {item.verifiedBy}
              </Text>
              <Text style={styles.verificationText}>
                At: {new Date(item.verifiedAt || '').toLocaleString()}
              </Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.attachmentsLabel}>Attachments:</Text>
              {item.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.attachmentItem}
                  onPress={() => {/* Handle attachment view */}}
                >
                  <Paperclip size={16} color={Colors.primary} />
                  <Text style={styles.attachmentText}>
                    Attachment {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusChange('completed')}
            >
              <CheckCircle2 size={16} color="white" />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.flagButton]}
              onPress={() => handleStatusChange('flagged')}
            >
              <AlertCircle size={16} color="white" />
              <Text style={styles.actionButtonText}>Flag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.naButton]}
              onPress={() => handleStatusChange('not_applicable')}
            >
              <XCircle size={16} color="white" />
              <Text style={styles.actionButtonText}>N/A</Text>
            </TouchableOpacity>

            {item.threshold !== undefined && (
              <TouchableOpacity
                style={[styles.actionButton, styles.valueButton]}
                onPress={() => setShowValueInput(true)}
              >
                <Text style={styles.actionButtonText}>Enter Value</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <Modal
        visible={showValueInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowValueInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Value</Text>
            <TextInput
              style={styles.valueInput}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder={`Enter value in ${item.unit || 'units'}`}
              placeholderTextColor={Colors.mediumGray}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowValueInput(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleValueSubmit}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  requiredText: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  actions: {
    marginLeft: 12,
  },
  details: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
  },
  verificationInfo: {
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  verificationText: {
    fontSize: 12,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
  },
  attachmentsContainer: {
    marginBottom: 16,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  attachmentText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  flagButton: {
    backgroundColor: Colors.error,
  },
  naButton: {
    backgroundColor: Colors.mediumGray,
  },
  valueButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  valueInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});

export default ChecklistItem; 