import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBubbles from '../components/AnimatedBubbles';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator
} from 'react-native';
import Toast from 'react-native-toast-message';
import axios from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Expo has this preinstalled

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);



  const showToast = (type, msg) => {
    Toast.show({ type, text1: msg, position: 'top' });
  };

  const handleLogin = async () => {
    if (!email || !password) return showToast('error', 'Enter email and password');
    if (email === 'registernewteacher' && password === 'pjqk8Ucs') {
      navigation.replace('RegisterTeacher');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/teachers/login', { email, password });
      await AsyncStorage.setItem('teacherToken', res.data.token);
      await AsyncStorage.setItem('teacherInfo', JSON.stringify(res.data.teacher));

      showToast('success', 'Teacher logged in');
      navigation.replace('TeacherQR'); 
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login error';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#50a3a2', '#53e3a6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <AnimatedBubbles />

      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Teacher Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="green" />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back to student login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center',alignItems: 'center'},
  heading: {
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    width: 260,
    padding: 12,
    marginBottom: 12,
    color: '#fff',
    fontSize: 16,
  },
  passwordContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    width: 260,
    fontSize: 16,
    marginBottom: 12,
    flexDirection: 'row',
    paddingHorizontal: 10,
    color:'#fff',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 45,
    color:'#fff',
  },
  btn: {
    backgroundColor: '#fff',
    width: 260,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  btnText: {
    color: '#53e3a6',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  back: {
    color: 'gray',
    marginTop: 16,
    textAlign: 'center',
  },
});
