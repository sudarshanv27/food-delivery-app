import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔐 Forgot Password</Text>
            <Text style={styles.subtitle}>Coming soon...</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#ff6b35' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
    backText: { color: '#ff6b35', fontSize: 16 }
});