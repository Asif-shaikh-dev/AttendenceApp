import React, { useEffect, useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBubbles from '../components/AnimatedBubbles'; // ⬅️ adjust path
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../config/api';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';


export default function AuthScreen() {
  const navigation = useNavigation();
  const [blocked, setBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const widthAnim = useRef(new Animated.Value(270)).current; // initial width
  const [isFocused, setIsFocused] = useState(false);
  const nameWidth = useRef(new Animated.Value(260)).current;
  const rollWidth = useRef(new Animated.Value(260)).current;
  const emailWidth = useRef(new Animated.Value(260)).current;
  const passwordWidth = useRef(new Animated.Value(260)).current;

  const animateWidth = (anim, toValue) => {
    Animated.timing(anim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    department: '', division: '', class: '', rollNo: ''
  });


  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const showToast = (type, msg) => {
    Toast.show({ type, text1: msg, position: 'top' });
  };
  useEffect(() => {
    const checkBlock = async () => {
      const blockedUntil = await AsyncStorage.getItem('blockedUntil');

      if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
        const mins = Math.ceil((parseInt(blockedUntil) - Date.now()) / 60000);
        setBlocked(true);
        setBlockTime(mins);

        // Auto unblock when time passes
        setTimeout(() => {
          setBlocked(false);
          setBlockTime(null);
        }, parseInt(blockedUntil) - Date.now());
      } else {
        await AsyncStorage.removeItem('blockedUntil');
      }
    };

    checkBlock();
  }, []);



  const handleSubmit = async () => {
    if (!form.email || !form.password || (isRegister && (!form.name || !form.year || !form.department || !form.division || !form.rollNo))) {
      return showToast('error', 'Please fill all fields');
    }
    setLoading(true);
    try {
      if (isRegister) {
        await axios.post('/students/register', form);
        showToast('success', 'Registered! Now login');
        setIsRegister(false);
      } else {
        const res = await axios.post('/students/login', {
          email: form.email,
          password: form.password,
        });

        const blockedUntil = await AsyncStorage.getItem('blockedUntil');
        if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
          const mins = Math.ceil((parseInt(blockedUntil) - Date.now()) / 60000);
          showToast('error', `Blocked. Try again in ${mins} minute(s)`);
          return;
        }

        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('studentId', res.data.student._id);

        showToast('success', 'Login successful');
        navigation.replace('QRScanner');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error occurred';
      //   console.error('Auth error:', err);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (<>
    <LinearGradient
      colors={['#50a3a2', '#53e3a6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <AnimatedBubbles />
      <SafeAreaView style={{flex:1}}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            {blocked && (
              <View style={styles.warningBox}>
                <Text style={styles.blockText}>Attendance marked.</Text>
                <Text style={styles.blockText}>Please wait {blockTime} minute(s).</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.teacherBtn}
              onPress={() => !blocked && navigation.navigate('TeacherLogin')}
              disabled={blocked || loading}
            >
              <Text style={[{ color: 'white' }, blocked && { opacity: 0.5, color: 'red' }]}>Teacher?</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>{isRegister ? 'Register' : 'Login'}</Text>
            {isRegister && (
              <Animated.View style={{ width: nameWidth }}>
                <TextInput
                  editable={!blocked}
                  style={styles.input}
                  placeholder="Name"
                  onChangeText={(text) => handleChange('name', text)}
                  // onFocus={() => animateWidth(nameWidth, 280)}
                  // onBlur={() => animateWidth(nameWidth, 260)}
                />
              </Animated.View>



            )}
            <Animated.View style={{ width: emailWidth }}>
              <TextInput
                style={styles.input}
                editable={!blocked}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(text) => handleChange('email', text)}
                // onFocus={() => animateWidth(emailWidth, 280)}
                // onBlur={() => animateWidth(emailWidth, 260)}
              />
            </Animated.View>

            <Animated.View style={{ width: passwordWidth }}>
              <TextInput
                style={styles.input}
                editable={!blocked}
                placeholder="Password"
                secureTextEntry
                onChangeText={(text) => handleChange('password', text)}
                // onFocus={() => animateWidth(passwordWidth, 280)}
                // onBlur={() => animateWidth(passwordWidth, 260)}
              />
            </Animated.View>

            {isRegister && (
              <>


                <Animated.View style={{ width: rollWidth }}>
                  <TextInput
                    editable={!blocked}
                    style={styles.input}
                    placeholder="Roll No"
                    onChangeText={(text) => handleChange('rollNo', text)}
                    keyboardType="numeric"
                    // onFocus={() => animateWidth(rollWidth, 280)}
                    // onBlur={() => animateWidth(rollWidth, 260)}
                  />
                </Animated.View>

                <View style={styles.dropdownContainer}>
                  <Picker
                    selectedValue={form.year}
                    onValueChange={(value) => handleChange('year', value)}
                    enabled={!blocked}
                  >
                    <Picker.Item label="Select Year" value="" />
                    <Picker.Item label="FY" value="FY" />
                    <Picker.Item label="SY" value="SY" />
                    <Picker.Item label="TY" value="TY" />
                  </Picker>
                </View>

                <View style={styles.dropdownContainer}>
                  <Picker
                    selectedValue={form.department}
                    onValueChange={(value) => handleChange('department', value)}
                    enabled={!blocked}
                  >
                    <Picker.Item label="Select Department" value="" />
                    <Picker.Item label="BSC_CS" value="BSC_CS" />
                    <Picker.Item label="BCOM" value="BCOM" />
                    <Picker.Item label="BA" value="BA" />
                  
                  </Picker>
                </View>

                <View style={styles.dropdownContainer}>
                  <Picker
                    selectedValue={form.division}
                    onValueChange={(value) => handleChange('division', value)}
                    enabled={!blocked}
                  >
                    <Picker.Item label="Select Division" value="" />
                    <Picker.Item label="A" value="A" />
                    <Picker.Item label="B" value="B" />
                  </Picker>
                </View>


              </>
            )}



            <TouchableOpacity style={[styles.btn, blocked && { opacity: 0.5 }]} onPress={handleSubmit} disabled={blocked || loading}>
              {loading ? <ActivityIndicator color="green" /> : <Text style={styles.btnText}>{isRegister ? 'Register' : 'Login'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsRegister(!isRegister)} disabled={blocked || loading}>
              <Text style={{ color: '#f2f2f2', marginTop: 10 }}>
                {isRegister ? 'Already have an account? Login' : 'New here? Register'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  </>

  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    
  },
  heading: {
    fontSize: 36,
    fontWeight: '300',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    textAlign: 'start',
    color: '#fff',
    fontSize: 16,
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
  teacherBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 99,
  },
  warningBox: {
    backgroundColor: '#fff2f2',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
  },
  blockText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    width: 260,
  },
});
