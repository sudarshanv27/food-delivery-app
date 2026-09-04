// delivery-app/src/screens/DeliveryTrackingScreen.js

import React, { useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';

const DeliveryTrackingScreen = ({ route, navigation }) => {
    // ================= ORDER DATA =================
    const order = route?.params?.order || {
        id: 'ORD001',
        customer: 'John Doe',
        restaurant: 'Pizza Paradise',
        address: 'Indiranagar, Bangalore',
        total: 443,
    };

    // ================= STATUS =================
    const [status, setStatus] =
        useState('accepted');

    // ================= UPDATE STATUS =================
    const updateStatus = (
        newStatus
    ) => {
        setStatus(newStatus);

        if (newStatus === 'delivered') {
            Alert.alert(
                'Success',
                'Order delivered successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            navigation?.goBack(),
                    },
                ]
            );
        }
    };

    return (
        <ScrollView
            style={styles.container}
        >
            {/* ================= HEADER ================= */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    🚚 Delivery Tracking
                </Text>
            </View>

            {/* ================= ORDER CARD ================= */}
            <View style={styles.card}>
                <Text style={styles.orderId}>
                    Order #{order.id}
                </Text>

                <Text style={styles.info}>
                    🍕 Restaurant:{' '}
                    {order.restaurant}
                </Text>

                <Text style={styles.info}>
                    👤 Customer:{' '}
                    {order.customer}
                </Text>

                <Text style={styles.info}>
                    📍 Address:{' '}
                    {order.address}
                </Text>

                <Text style={styles.total}>
                    ₹{order.total}
                </Text>

                {/* ================= STATUS ================= */}
                <View
                    style={styles.statusBox}
                >
                    <Text
                        style={styles.statusLabel}
                    >
                        Current Status
                    </Text>

                    <Text
                        style={styles.statusText}
                    >
                        {status.toUpperCase()}
                    </Text>
                </View>

                {/* ================= BUTTONS ================= */}
                {status ===
                    'accepted' && (
                        <TouchableOpacity
                            style={
                                styles.pickupBtn
                            }
                            onPress={() =>
                                updateStatus(
                                    'picked_up'
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.buttonText
                                }
                            >
                                Mark as Picked Up
                            </Text>
                        </TouchableOpacity>
                    )}

                {status ===
                    'picked_up' && (
                        <TouchableOpacity
                            style={
                                styles.deliverBtn
                            }
                            onPress={() =>
                                updateStatus(
                                    'delivered'
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.buttonText
                                }
                            >
                                Mark as Delivered
                            </Text>
                        </TouchableOpacity>
                    )}

                {/* ================= CALL BUTTON ================= */}
                <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() =>
                        Alert.alert(
                            'Calling Customer',
                            'Calling customer...'
                        )
                    }
                >
                    <Text
                        style={styles.buttonText}
                    >
                        📞 Call Customer
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default DeliveryTrackingScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },

    header: {
        backgroundColor: '#ff4757',
        padding: 20,
        paddingTop: 50,
        alignItems: 'center',
    },

    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },

    card: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 20,
        borderRadius: 16,
        elevation: 4,
    },

    orderId: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ff4757',
        marginBottom: 20,
    },

    info: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
    },

    total: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2ed573',
        marginTop: 15,
    },

    statusBox: {
        marginTop: 25,
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#fff5f5',
        alignItems: 'center',
    },

    statusLabel: {
        fontSize: 14,
        color: '#777',
    },

    statusText: {
        marginTop: 8,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff4757',
    },

    pickupBtn: {
        marginTop: 25,
        backgroundColor: '#ffa502',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },

    deliverBtn: {
        marginTop: 25,
        backgroundColor: '#2ed573',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },

    callBtn: {
        marginTop: 15,
        backgroundColor: '#1e90ff',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});