import React, { useRef, useState } from 'react';
import { Animated, TextInput, StyleSheet } from 'react-native';

export default function AnimatedTextInput({ value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default', editable = true }) {
  const [focused, setFocused] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const animatedStyle = {
    width: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['90%', '100%'],
    }),
    backgroundColor: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#eeeeee', '#ffffff'],
    }),
    borderColor: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#ccc', '#888'],
    }),
  };

  return (
    <Animated.View style={[styles.inputWrapper, animatedStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={focused ? '#777' : '#555'}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        style={styles.textInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
  },
});
