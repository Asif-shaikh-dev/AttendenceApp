import React, { useEffect, useState } from 'react';
import Svg, { G, Path } from 'react-native-svg'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView,
  Button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../config/api';
import Toast from 'react-native-toast-message';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function TeacherHistoryScreen() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [division, setDivision] = useState('A');
  const [printMode, setPrintMode] = useState(false);
  const [visibleStudentCounts, setVisibleStudentCounts] = useState({});

  const handleSessionScroll = (e, idx, totalStudents) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isCloseToBottom && visibleStudentCounts[idx] < totalStudents) {
      setVisibleStudentCounts(prev => ({
        ...prev,
        [idx]: Math.min(prev[idx] + 20, totalStudents), // load next 20
      }));
    }
  };



  const fetchHistory = async () => {

    try {
      setLoading(true);
      const info = await AsyncStorage.getItem('teacherInfo');

      if (!info) {
        console.log("No teacher info found in storage");
        return Toast.show({ type: 'error', text1: 'Please login again (teacher info missing)' });
      }
      
      let teacher;
      

        teacher = JSON.parse(info);
    
      

      let res;
      try {
        res = await axios.get(
          `/teachers/history/${teacher.teacherId}?division=${division}&year=${teacher.year}`
        );
        // console.log(teacher.year)

      } catch (err) {
        console.log('Error teacher info baba:', err.message);
      }

      const rawHistory = res.data.history || [];
      let templateRes;
      try {
        templateRes = await axios.get(
          `/students/template?division=${division}&year=${teacher.year}`
        );

      } catch (err) {
        console.log('Error fetching template students:', err);
      }

      const templateStudents = templateRes?.data?.students || [];
      // console.log('Template Students:', templateStudents);
      //prints Template Students: [{"_id": "6887b686cd2bd5ace24c8c4d", "name": "salmanbhai", "rollNo": 200}]

      const mergedHistory = rawHistory.map(session => {
        const presentRollNos = session.students.map(s => s.rollNo.toString());
        const missingStudents = templateStudents.filter(
          tmpl => !presentRollNos.includes(tmpl.rollNo.toString())
        );
        const extraAbsent = missingStudents.map(ms => ({
          name: ms.name,
          rollNo: ms.rollNo,
          status: 'A',
        }));
        const fullStudentList = [...session.students, ...extraAbsent].sort(
          (a, b) => parseInt(a.rollNo.toString()) - parseInt(b.rollNo.toString())
        );

        return {
          ...session,
          students: fullStudentList,
          presentCount: fullStudentList.filter(s => s.status === 'P').length,
          total: fullStudentList.length,
          subject: session.subject || 'Unknown',
        };
      });

      setHistory(mergedHistory);


      const initialCounts = {};
      mergedHistory.forEach((session, idx) => {
        initialCounts[idx] = 20; // Start with 20 students shown per session
      });
      setVisibleStudentCounts(initialCounts);

    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Failed to load history' });
    } finally {
      setLoading(false);
    }
  };

  const printTableHTML = async (students, sessions, subject) => {
    students.sort((a, b) => a.rollNo - b.rollNo);
    const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            font-family: sans-serif;
            font-size: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          th {
            background-color: #f2f2f2;
          }
          .present {
            color: green;
            font-weight: bold;
          }
          .absent {
            color: red;
            font-weight: bold;
          }
  
          @media print {
            body {
              margin: 0;
              font-size: 10px;
            }
            h1 {
              page-break-after: avoid;
            }
            table {
              page-break-inside: avoid;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <h1>Attendance Sheet for ${subject || "Unknown Subject"}</h1>
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              ${sessions.map(s => `<th>${s.date}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${students.map(student => `
              <tr>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                ${sessions.map(s => {
      const entry = s.students?.find(stu => stu.rollNo === student.rollNo);
      const status = entry?.status || 'A';
      const className = status === 'P' ? 'present' : 'absent';
      return `<td class="${className}">${status}</td>`;
    }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;


    try {
      const path = FileSystem.documentDirectory + 'attendance.html';
      await FileSystem.writeAsStringAsync(path, html, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: 'text/html', dialogTitle: 'Print or Share' });
    } catch (error) {
      console.error('Error sharing HTML:', error);
    }
  };


  
  useEffect(() => {
    // console.log(division)
    fetchHistory();
  }, [division]);

  const getUniqueStudents = () => {
    const map = new Map();
    history.forEach(session => {
      session.students.forEach(s => {
        if (!map.has(s.rollNo)) {
          map.set(s.rollNo, { rollNo: s.rollNo, name: s.name });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const rollA = typeof a.rollNo === 'string' ? a.rollNo : '';
      const rollB = typeof b.rollNo === 'string' ? b.rollNo : '';
      return rollA.localeCompare(rollB);
    });
  };

  const renderPrintableTable = () => {
    const students = getUniqueStudents();
    return (
      <ScrollView horizontal>
        <View>
          <View style={[styles.tableRow, { backgroundColor: '#eee' }]}>
            <Text style={styles.cell}>Roll No</Text>
            <Text style={styles.cell}>Name</Text>
            {history.map((session, i) => (
              <Text key={i} style={[styles.cell, { minWidth: 70 }]}>
                {session.date}
              </Text>
            ))}
          </View>

          {students.map((student, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cell}>{student.rollNo}</Text>
              <Text style={styles.cell}>{student.name}</Text>
              {history.map((session, j) => {
                const entry = session.students.find(s => s.rollNo === student.rollNo);
                const status = entry?.status || 'A';
                return (
                  <Text
                    key={j}
                    style={[
                      styles.cell,
                      {
                        color: status === 'P' ? 'green' : 'red',
                        fontWeight: 'bold',
                        minWidth: 70,
                      },
                    ]}
                  >
                    {status}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Print Attendence</Text>

      {/* Division Switcher */}
      <View style={styles.divSwitch}>


        <TouchableOpacity
          style={[styles.divBtn, division === 'A' && styles.activeDiv]}
          onPress={() => setDivision('A')}
        >
          <Text>Div A</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.divBtn, division === 'B' && styles.activeDiv]}
          onPress={() => setDivision('B')}
        >
          <Text>Div B</Text>
        </TouchableOpacity>


      </View>

      {/* Print Button */}
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity style={styles.printBtn} onPress={() => setPrintMode(!printMode)}>
          <Text style={{ color: 'white' }}>{printMode ? 'Back to View' : 'Show Printable Table'}</Text>
        </TouchableOpacity>
      </View>

      {printMode && history.length > 0 && (
        <Button
          title="Print Attendance"
          onPress={() =>
            printTableHTML(getUniqueStudents(), history, history[0]?.subject || 'Unknown Subject')
          }
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : printMode ? (
        renderPrintableTable()
      ) : (
        <ScrollView>
          <View>
            {history.length === 0 ? (
              <Text>No records found.</Text>
            ) : (
              history.slice(-6).map((session, idx) => (
                <View key={idx} style={styles.tableBlock}>
                  <Text style={styles.tableHeader}>
                    {session.subject} - {session.date} ({session.presentCount}/{session.total})
                  </Text>

                  {/* Table column headers */}
                  <View style={styles.tableRow}>
                    <Text style={styles.cell}>Roll No</Text>
                    <Text style={styles.cell}>Name</Text>
                    <Text style={styles.cell}>Status</Text>
                  </View>

                  <ScrollView
                    style={styles.studentListContainer}
                    nestedScrollEnabled={true}
                    onScroll={(e) => handleSessionScroll(e, idx, session.total)}
                    scrollEventThrottle={16}
                  >
                    {session.students.slice(0, visibleStudentCounts[idx] || 20).map((s, i) => (


                      <View key={i} style={styles.tableRow}>
                        <Text style={styles.cell}>{s.rollNo}</Text>
                        <Text style={styles.cell}>{s.name}</Text>
                        <Text
                          style={[
                            styles.cell,
                            {
                              color: s.status === 'P' ? 'green' : 'red',
                              fontWeight: 'bold',
                            },
                          ]}
                        >
                          {s.status}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))
            )}
          </View>
        </ScrollView>

      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', marginTop: 25 },
  divSwitch: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  divBtn: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 6,
  },
  activeDiv: {
    backgroundColor: '#e0f2ff',
    borderColor: '#1e90ff',
  },
  printBtn: {
    backgroundColor: '#1e90ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },

  tableBlock: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#f9f9f9',
  },

  studentListContainer: {
    maxHeight: 200, // fixed scrollable height
    marginTop: 4,
  },

  tableHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingVertical: 4,
  },

  cell: {
    width: 100,
    textAlign: 'center',
  },

});
