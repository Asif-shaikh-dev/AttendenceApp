import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import axios from '../config/api';
import { Ionicons } from '@expo/vector-icons'; // Expo has this preinstalled

const RegisterTeacher = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [subject, setSubject] = useState('');
    const [year, setYear] = useState('')
    const showToast = (type, msg) => {
        Toast.show({ type, text1: msg, position: 'top' });
    };


    const handleRegister = async () => {
        if (!name || !email || !password || !teacherId || !subject || !year) {
            return showToast('error', 'Needs Full Details');
        }
    
        try {
            const response = await axios.post('/teachers/register', {
                name,
                email,
                password,
                teacherId,
                subject,
                year,
            });
            
            showToast('success', 'Teacher registered successfully!');
    
            // Clear form fields
            setName('');
            setEmail('');
            setPassword('');
            setTeacherId('');
            setSubject('');
            setYear('');
        } catch (err) {
            console.error('Register error:', err.response?.data || err.message);
            showToast('error', err.response?.data?.message || 'Registration failed');
        }
    };
    

    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.title}>Register Teacher</Text>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} // adjust as per header height if any
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View style={styles.container}>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
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
                        <TextInput
                            style={styles.input}
                            placeholder="Teacher ID"
                            value={teacherId}
                            onChangeText={setTeacherId}
                        />
                        <Text style={styles.label}>Subject</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={subject}
                                onValueChange={(itemValue) => setSubject(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="#333"
                            >
                                <Picker.Item label="Select Subject" value="" />
                                <Picker.Item label="Maths" value="Maths" />
                                <Picker.Item label="Python" value="Python" />
                                <Picker.Item label="SE" value="SE" />
                                <Picker.Item label="C" value="C" />
                                <Picker.Item label="DBMS" value="DBMS" />
                                <Picker.Item label="IKS" value="IKS" /> 
                            </Picker>
                        </View>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={year}
                                onValueChange={(itemValue) => setYear(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="#333"
                            >

                                <Picker.Item label="Select Year" value="" />
                                <Picker.Item label="FY" value="FY" />
                                <Picker.Item label="SY" value="SY" />
                                <Picker.Item label="TY" value="TY" />
                            </Picker>
                        </View>

                        <Button title="Register" onPress={handleRegister} />
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>


        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',

    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginTop: 35,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },

    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    picker: {
        height: 50,
        marginBottom: 20,
    },
    label: {
        marginBottom: 5,
        fontWeight: 'bold',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
    },

    picker: {
        height: 50,
        color: '#333',
        paddingHorizontal: 10,
    },

    passwordContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        height: 45,

    },

});

export default RegisterTeacher;
