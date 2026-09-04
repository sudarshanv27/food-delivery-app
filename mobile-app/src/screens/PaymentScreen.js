import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    ActivityIndicator, TextInput
} from 'react-native';
import { CameraView } from 'expo-camera';
import api from '../services/api';

const PaymentScreen = ({ route, navigation }) => {
    const { orderId, amount } = route.params;
    const [scanning, setScanning] = useState(true);
    const [manualPayment, setManualPayment] = useState(false);
    const [paymentId, setPaymentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(true);

    const handleBarCodeScanned = async ({ data }) => {
        if (!scanning) return;
        setScanning(false);
        
        setLoading(true);
        try {
            const response = await api.post('/payment/process', {
                order_id: orderId,
                amount: amount,
                payment_method: 'qr',
                qr_data: data
            });
            
            if (response.data.success) {
                Alert.alert(
                    'Payment Successful',
                    `Payment of ₿${amount.toFixed(2)} processed!`,
                    [{ text: 'OK', onPress: () => navigation.replace('OrderTracking', { orderId }) }]
                );
            }
        } catch (error) {
            Alert.alert('Payment Failed', 'Please try again');
            setScanning(true);
        } finally {
            setLoading(false);
        }
    };

    const handleManualPayment = async () => {
        if (!paymentId || paymentId.length < 5) {
            Alert.alert('Error', 'Please enter a valid payment ID');
            return;
        }
        
        setLoading(true);
        try {
            const response = await api.post('/payment/process', {
                order_id: orderId,
                amount: amount,
                payment_method: 'manual',
                payment_id: paymentId
            });
            
            if (response.data.success) {
                Alert.alert(
                    'Payment Successful',
                    `Payment of ₿${amount.toFixed(2)} processed!`,
                    [{ text: 'OK', onPress: () => navigation.replace('OrderTracking', { orderId }) }]
                );
            }
        } catch (error) {
            Alert.alert('Payment Failed', 'Invalid payment ID');
        } finally {
            setLoading(false);
        }
    };

    if (manualPayment) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Manual Payment</Text>
                <Text style={styles.amount}>Amount: ₿{amount.toFixed(2)}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter UPI ID / Payment Reference"
                    value={paymentId}
                    onChangeText={setPaymentId}
                />
                <TouchableOpacity style={styles.button} onPress={handleManualPayment} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Payment</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setManualPayment(false)}>
                    <Text style={styles.secondaryButtonText}>Scan QR Code</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Scan QR Code to Pay</Text>
            <Text style={styles.amount}>Amount: ₿{amount.toFixed(2)}</Text>
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                />
                {!scanning && (
                    <TouchableOpacity style={styles.rescanButton} onPress={() => setScanning(true)}>
                        <Text style={styles.rescanText}>Scan Again</Text>
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setManualPayment(true)}>
                <Text style={styles.secondaryButtonText}>Enter Payment Manually</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#FF6B6B' },
    amount: { fontSize: 20, textAlign: 'center', marginBottom: 20, color: '#333' },
    cameraContainer: { height: 400, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
    camera: { flex: 1 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 20 },
    button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    secondaryButton: { backgroundColor: '#FF6B6B', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    secondaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    rescanButton: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    rescanText: { color: '#fff' }
});

export default PaymentScreen;