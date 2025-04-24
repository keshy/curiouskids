
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import QuestionInput from '../components/QuestionInput';
import ResponseDisplay from '../components/ResponseDisplay';
import { AskResponse } from '../types';

export default function Home() {
  const [response, setResponse] = useState<AskResponse | null>(null);

  const handleAsk = async (question: string) => {
    try {
      const res = await fetch('https://your-replit-app.replit.app/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          contentFilter: 'strict',
          generateImage: true,
          generateAudio: true,
        }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <QuestionInput onAsk={handleAsk} />
      {response && <ResponseDisplay response={response} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
