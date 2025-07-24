import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: number;
}

export default function LoadingSpinner({ size = 40 }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 3,
      borderColor: colors.border,
      borderTopColor: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.spinner, { transform: [{ rotate }] }]} 
      />
    </View>
  );
}