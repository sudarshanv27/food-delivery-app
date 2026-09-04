// delivery-app/src/screens/LoginScreen.js

import React, { useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

const LoginScreen = ({
    navigation,
}) => {
    // ================= STATES =================
    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    // ================= LOGIN =================
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(
                'Error',
                'Please enter email and password'
            );
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            // DEMO LOGIN
            if (
                email ===
                'delivery@foodapp.com' &&
                password === 'delivery123'
            ) {
                Alert.alert(
                    'Success',
                    'Login successful!'
                );

                navigation?.replace(
                    'Main'
                );
            } else {
                Alert.alert(
                    'Invalid Login',
                    'Use:\nEmail: delivery@foodapp.com\nPassword: delivery123'
                );
            }
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={
                Platform.OS === 'ios'
                    ? 'padding'
                    : undefined
            }
        >
            <View style={styles.card}>
                {/* ================= TITLE ================= */}
                <Text style={styles.logo}>
                    🛵
                </Text>

                <Text style={styles.title}>
                    Foodie Dash
                </Text>

                <Text
                    style={styles.subtitle}
                >
                    Delivery Partner Login
                </Text>

                {/* ================= EMAIL ================= */}
                <TextInput
                    style={styles.input}
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                {/* ================= PASSWORD ================= */}
                <TextInput
                    style={styles.input}
                    placeholder="Enter Password"
                    value={password}
                    onChangeText={
                        setPassword
                    }
                    secureTextEntry
                />

                {/* ================= BUTTON ================= */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                        {loading
                            ? 'Logging in...'
                            : 'Login'}
                    </Text>
                </TouchableOpacity>

                {/* ================= DEMO ================= */}
                <View
                    style={styles.demoBox}
                >
                    <Text
                        style={styles.demoTitle}
                    >
                        Demo Credentials
                    </Text>

                    <Text
                        style={styles.demoText}
                    >
                        Email:
                        delivery@foodapp.com
                    </Text>

                    <Text
                        style={styles.demoText}
                    >
                        Password:
                        delivery123
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ff4757',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        elevation: 5,
    },

    logo: {
        fontSize: 55,
        textAlign: 'center',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        color: '#ff4757',
    },

    subtitle: {
        textAlign: 'center',
        color: '#777',
        marginTop: 8,
        marginBottom: 25,
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 14,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },

    button: {
        backgroundColor: '#ff4757',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    demoBox: {
        marginTop: 25,
        padding: 15,
        backgroundColor: '#fff5f5',
        borderRadius: 12,
    },

    demoTitle: {
        fontWeight: 'bold',
        color: '#ff4757',
        marginBottom: 8,
    },

    demoText: {
        color: '#555',
        marginBottom: 4,
    },
});