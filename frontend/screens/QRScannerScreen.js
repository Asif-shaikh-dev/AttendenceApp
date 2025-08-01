import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBubbles from '../components/AnimatedBubbles';
import {
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator,
  Touchable,
  TouchableOpacity
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../config/api';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [student, setStudent] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(null); // remaining time
  const [scanError, setScanError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const checkBlocked = async () => {
      const blockedUntil = await AsyncStorage.getItem('blockedUntil');
      if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
        setBlocked(true);
        const remaining = parseInt(blockedUntil) - Date.now();
        setBlockTime(Math.ceil(remaining / 60000));
        setTimeout(() => setBlocked(false), remaining);
      } else {
        await AsyncStorage.removeItem('blockedUntil');
        setBlocked(false);
      }
    };
    checkBlocked();
  }, []);

  useEffect(() => {
    const loadStudent = async () => {
      const id = await AsyncStorage.getItem('studentId');
      if (!id) return;
      const res = await axios.get(`/students/${id}`);
      setStudent(res.data);
    };

    requestPermission();
    loadStudent();
  }, []);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || blocked) return;

    try {
      if (!data || typeof data !== 'string' || !data.startsWith('{')) {
        Toast.show({ type: 'error', text1: 'Invalid QR format' });
        return;
      }

      setScanned(true);

      let qr;
      try {
        qr = JSON.parse(data);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'QR data corrupted' });
        setScanned(false);
        return;
      }

      if (!student) {
        Toast.show({ type: 'error', text1: 'Student not loaded' });
        setScanned(false);
        return;
      }

      // Year Mismatch
      if (student.year !== qr.year) {
        Toast.show({ type: 'error', text1: 'Year mismatch ❌' });
        setTimeout(() => setScanned(false), 3000);
        return;
      }

      // Division Mismatch
      if (student.division !== qr.division) {
        Toast.show({ type: 'error', text1: 'Division mismatch ❌' });
        setTimeout(() => setScanned(false), 3000);
        return;
      }

      // Check presentyActive
      try {
        const validationRes = await axios.get(`/teachers/validate-session/${qr.sessionId}`);
        if (!validationRes.data.presentyActive) {
          Toast.show({ type: 'error', text1: 'Presenty not active by teacher 🚫' });
          setScanned(false);
          return;
        }
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Failed to validate session' });
        setScanned(false);
        return;
      }

      // Check for block
      const blockedUntil = await AsyncStorage.getItem('blockedUntil');
      if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
        const mins = Math.ceil((parseInt(blockedUntil) - Date.now()) / 60000);
        setBlocked(true);
        setBlockTime(mins);
        Toast.show({ type: 'error', text1: `Wait ${mins} min(s) before next scan ⏳` });

        setTimeout(() => {
          setBlocked(false);
          setBlockTime(null);
        }, parseInt(blockedUntil) - Date.now());

        return;
      }

      // Mark attendance

      await axios.post('/students/scan', {
        studentId: student._id,
        qrData: {
          sessionId: qr.sessionId,
          division: qr.division,
          date: qr.date,
          year: qr.year,
        },
      });

      Toast.show({ type: 'success', text1: 'Attendance marked ✅' });

      // block timer (30 mins
      const blockUntil = Date.now() + 30 * 60 * 1000;
      await AsyncStorage.setItem('blockedUntil', blockUntil.toString());
      console.log(blockedUntil)

      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('studentId');
      navigation.replace('Auth');


    } catch (err) {
      Toast.show({ type: 'error', text1: 'Invalid or expired QR ❌' });
      setScanned(false);
    }
  };


  if (!permission) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera access required</Text>
        <Text onPress={requestPermission} style={styles.grantText}>Grant Permission</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#50a3a2', '#53e3a6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <AnimatedBubbles />
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={{ marginBottom: 20, alignSelf: 'center' }}>
          <Text style={{ color: 'white' }}> Click Here to Navigate Back</Text>
        </TouchableOpacity>





        <Text style={styles.text}>Scan QR to Mark Attendance</Text>

        {blocked ? (
          <View style={styles.blockedBox}>
            <Text style={styles.blockedText}>⏳ You're blocked from scanning</Text>
            {blockTime && <Text style={styles.blockedSubtext}>Please wait {blockTime} more minute(s)</Text>}
          </View>
        ) : (
          <View style={[styles.scannerBox, scanError && styles.errorBorder]}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            {scanError && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>{errorMessage}</Text>
              </View>
            )}
          </View>
        )}
        <View style={{
          backgroundColor: '#fff2f2',
          borderWidth: 1,
          borderColor: '#1e90ff',
          borderRadius: 10,
          padding: 15,
          marginTop: 20,
          width: '75%',
          alignItems: 'center',
          gap: 5
        }}>
          <Text style={{ color: '#1e90ff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            {student?.name} ({student?.rollNo})
          </Text>
          <Text style={{ color: '#1e90ff', fontSize: 16, fontWeight: '300' }}>
            {student?.year} - Div {student?.division}
          </Text>
        </View>


      </SafeAreaView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 12, color: 'white' },
  scannerBox: {
    width: 260,
    height: 260,
    borderColor: '#1e90ff',
    borderWidth: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grantText: { color: 'blue', marginTop: 10 },
  errorBorder: {
    borderColor: 'red',
    borderWidth: 4,
  },
  warningBox: {
    position: 'absolute',
    bottom: -60,
    backgroundColor: '#ffcccc',
    borderColor: 'red',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    alignSelf: 'center',
  },
  warningText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  blockedBox: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff0f0',
    borderColor: 'red',
    borderWidth: 2,
  },
  blockedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
  blockedSubtext: {
    fontSize: 16,
    marginTop: 6,
    color: '#555',
    textAlign: 'center',
  },

});
