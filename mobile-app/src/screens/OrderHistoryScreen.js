// OrderHistoryScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrderHistoryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>📋 My Orders</Text>
            <Text style={styles.subtitle}>No orders yet</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#ff6b35' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 10 }
});