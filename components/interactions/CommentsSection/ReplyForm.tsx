import React, { useState, memo } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ReplyFormProps } from '../../../types/entities/comment.types';

const ReplyForm: React.FC<ReplyFormProps> = memo(({ 
  parentId, 
  onSubmit, 
  isSubmitting 
}) => {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async () => {
    if (replyText.trim()) {
      await onSubmit(parentId, replyText);
      setReplyText("");
    }
  };

  return (
    <View style={styles.replyInputContainer}>
      <TextInput
        style={styles.replyInput}
        placeholder="Écrire une réponse..."
        value={replyText}
        onChangeText={setReplyText}
        multiline={true}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={[
          styles.submitReplyButton,
          isSubmitting && { backgroundColor: "#ccc" },
        ]}
        disabled={isSubmitting || !replyText.trim()}
      >
        <Text style={styles.submitReplyButtonText}>
          {isSubmitting ? "..." : "Envoyer"}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: "#f8f8f8",
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    textAlignVertical: "center",
    minHeight: 20,
  },
  submitReplyButton: {
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 30,
    marginLeft: 10,
  },
  submitReplyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ReplyForm;