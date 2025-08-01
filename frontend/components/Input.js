import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

export default function Input({ placeholder, ...rest }) {
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder={placeholder} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
  },
});
