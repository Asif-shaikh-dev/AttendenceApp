import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TeacherLogin from '../screens/TeacherLogin';
import TeacherQR from '../screens/TeacherQR';
import TeacherHistoryScreen from '../screens/TeacherHistoryScreen';
import RegisterTeacher from '../screens/RegisterTeacher';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState('Auth');

  //   useEffect(() => {
  //     AsyncStorage.getItem('token').then(token => {
  //       if (token) {
  //         setInitialRoute('QRScanner');
  //       }
  //     });
  //   }, []);

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{
      animation: 'fade', // Options: 'slide_from_right', 'fade', 'none'
      headerShown: false,
    }}>
      <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TeacherLogin" component={TeacherLogin} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterTeacher" component={RegisterTeacher} options={{ headerShown: false }} />

      <Stack.Screen name="TeacherQR" component={TeacherQR} options={{ headerShown: false }} />
      <Stack.Screen name="AttendanceList" component={TeacherHistoryScreen} />
    </Stack.Navigator>
  );
}
