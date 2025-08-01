import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBubbles from '../components/AnimatedBubbles';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, ScrollView
} from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../config/api';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import { Platform, StatusBar } from 'react-native';
import TextTicker from 'react-native-text-ticker';


export default function TeacherQR() {
  const [division, setDivision] = useState('A');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [attendanceList, setAttendanceList] = useState([]);
  const [total, setTotal] = useState({ present: 0, total: 0 });
  const [techername, setTechername] = useState('');

  const navigation = useNavigation();


  //this is the function to fetch the QR code data from the backend like subject,teacherid,and then create a session
  
  const fetchQR = async () => {
    try {
      setLoading(true);
      const info = await AsyncStorage.getItem('teacherInfo');
      const teacher = JSON.parse(info);
      setTechername(teacher.name);
      const res = await axios.post('/teachers/generate-qr', {
        teacherId: teacher.teacherId,
        year: teacher.year,
        subject: teacher.subject,
        division,
      });
      setQrData(res.data.qrData);
      // console.log('QR Data:', res.data.qrData);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'QR generation failed' });
    } finally {
      setLoading(false);
    }
  };
  
  
  const [presentyActive, setPresentyActive] = useState(false);

  const togglePresenty = async () => {
    try {
      const info = await AsyncStorage.getItem('teacherInfo');
      const teacher = JSON.parse(info);

      const res = await axios.post('/teachers/toggle-presenty', {
        teacherId: teacher.teacherId,
        active: !presentyActive,
      });

      setPresentyActive(!presentyActive);
      Toast.show({ type: 'success', text1: res.data.message });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to toggle presenty' });
    }
  };

  useEffect(() => {
    fetchQR();
  }, [division]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('teacherToken');
    await AsyncStorage.removeItem('teacherInfo');
    Toast.show({ type: 'success', text1: 'Logged out successfully' });

    navigation.replace('Auth');
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

        <View style={styles.header}>
          <TextTicker
            style={styles.tickerText}
            duration={6000}
            loop
            bounce
            repeatSpacer={50}
            marqueeDelay={1000}
          >
            {techername || 'QR'} - {qrData?.subject || 'Subject'} - {qrData?.year}
          </TextTicker>

          <TouchableOpacity style={styles.logOutBtn} onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>



        {/* Division Selector */}
        <View style={styles.divSelect}>
          {['A', 'B'].map(div => (
            <TouchableOpacity
              key={div}
              style={[
                styles.divBtn,
                division === div ? styles.active : styles.inactive
              ]}
              onPress={() => setDivision(div)}
            >
              <Text style={{
                color: division === div ? '#fff' : '#64748b', // white if active, gray if inactive
                fontWeight: '500'
              }}>
                Div {div}
              </Text>
            </TouchableOpacity>
          ))}
        </View>



        {/* QR Display */}
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : qrData ? (
            <>
              <QRCode
                value={JSON.stringify({
                  sessionId: qrData._id, //Session Id  
                  division: qrData.division,
                  date: qrData.date,
                  year: qrData.year

                })}
                size={250}
              />
              <Text style={styles.qrLabel}>
                QR for {qrData.subject} - Div {qrData.division}
              </Text>
              <View style={styles.PresntyDiv}>
                <TouchableOpacity
                  style={[
                    styles.presentyBtn,
                    presentyActive ? styles.presentyActive : styles.presentyInactive,
                  ]}
                  onPress={togglePresenty}
                >
                  <Text style={styles.presentyText}>
                    {presentyActive ? "Disable Presenty" : "Set Presenty Active"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.monitorBtn}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('AttendanceList')}
                >
                  <Text style={styles.monitorBtnText}>Monitor Attendance</Text>
                </TouchableOpacity>

              </View>
            </>
          ) : (
            <Text>No QR Data</Text>
          )}
        </View>

        {/* Attendance Table */}


      </SafeAreaView >
    </LinearGradient>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // for spacing between name and logout
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#dce3ea',
    paddingHorizontal: 10,
  },
  tickerText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#fff',
    maxWidth: 200, // Adjust based on screen space
    marginBottom: 10
  },


  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b', // slate-800

  },

  logout: {
    color: '#53e3a6',
    fontWeight: '400',
    textAlign: 'center',
    fontSize: 14,
  },
  logOutBtn: {
    backgroundColor: '#fff',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 1,

  },

  presentyBtn: {
    backgroundColor: '#fff',
    width: 260,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },

  presentyActive: {
    backgroundColor: '#ef4444', // red-500
  },

  presentyInactive: {
    backgroundColor: '#50a3a2', // green-500
  },

  presentyText: {
    color: 'white',
    fontWeight: '300',
    textAlign: 'center',
    fontSize: 18,
  },
  PresntyDiv: {
    flex: 'column',
    gap: 10,
    marginTop: 20
  },
  divSelect: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  divBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 10,
    elevation: 1,
  },

  active: {
    backgroundColor: '#202224', // blue-500
    borderColor: '##f2f2f2',
  },

  inactive: {
    backgroundColor: '#f2f2f2',     // light bg
    borderColor: '#cbd5e1',         // gray border
    opacity: 0.8,
  },
  qrLabel: {
    marginTop: 15,
    fontSize: 16,
    color: '#1f2937', // gray-800
    fontWeight: '500',
  },

  monitorBtn: {
    backgroundColor: '#fff',
    width: 260,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },

  monitorBtnText: {
    color: '#53e3a6',
    fontWeight: '300',
    textAlign: 'center',
    fontSize: 18,
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

  tableContainer: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
  },

  tableTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#0f172a',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },

  headerRow: {
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 2,
    borderColor: '#3b82f6',
  },

  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#334155',
  },

  printBtn: {
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: '#1e40af', // blue-800
    borderRadius: 10,
  },

  printBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});



