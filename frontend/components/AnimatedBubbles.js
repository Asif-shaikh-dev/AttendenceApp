import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const createBubble = (index) => {
  const size = Math.random() * 80 + 20;
  const left = Math.random() * width;
  const delay = Math.random() * 5000;
  const duration = Math.random() * 10000 + 15000;

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateY, {
        toValue: -200,
        duration,
        delay,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      key={index}
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          left,
          transform: [{ translateY }],
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
      ]}
    />
  );
};

export default function AnimatedBubbles() {
  return <View style={StyleSheet.absoluteFill}>{Array.from({ length: 10 }, (_, i) => createBubble(i))}</View>;
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: -100,
    borderRadius: 100,
  },
});
