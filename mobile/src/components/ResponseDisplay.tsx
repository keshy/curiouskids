
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AskResponse } from '../types';

interface Props {
  response: AskResponse;
}

export default function ResponseDisplay({ response }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{response.text}</Text>
      {response.imageUrl && (
        <Image
          source={{ uri: response.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 8,
  },
});
