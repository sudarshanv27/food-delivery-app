import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Alert, ActivityIndicator
} from 'react-native';
import api from '../services/api';

const CheckoutScreen = ({ route, navigation }) => {
    const { cart, subtotal, deliveryFee, restaurant } = route.params;
    const [address, setAddress] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);

    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    const handlePlaceOrder = async () => {
        if (!address) {
            Alert.alert('Error', 'Please enter delivery address');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
                items: cart,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                tax: tax,
                total_amount: total,
                payment_method: 'pending',
                delivery_address: address,
                special_instructions: instructions
            };

            const response = await api.post('/orders/create', orderData);
            
            if (response.data.success) {
                Alert.alert(
                    'Order Placed!',
                    `Order #${response.data.order_number} has been placed successfully`,
                    [
                        {
                            text: 'Pay Now',
                            onPress: () => navigation.replace('Payment', {
                                orderId: response.data.order_id,
                                amount: total
                            })
                        },
                        {
                            text: 'Later',
                            onPress: () => navigation.navigate('Orders')
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Checkout</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <TextInput
                    style={styles.addressInput}
                    placeholder="Enter your full address"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
                <TextInput
                    style={styles.instructionsInput}
                    placeholder="e.g., Leave at door, extra napkins, etc."
                    value={instructions}
                    onChangeText={setInstructions}
                    multiline
                    numberOfLines={2}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                    <Text>Subtotal</Text>
                    <Text>₿{subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text>Delivery Fee</Text>
                    <Text>₿{deliveryFee.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text>Tax (8%)</Text>
                    <Text>₿{tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalText}>Total</Text>
                    <Text style={styles.totalAmount}>₿{total.toFixed(2)}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.placeOrderButton}
                onPress={handlePlaceOrder}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.placeOrderText}>Place Order • ₿{total.toFixed(2)}</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    title: { fontSize: 28, fontWeight: 'bold', padding: 20, color: '#FF6B6B' },
    section: { backgroundColor: '#fff', marginBottom: 15, padding: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    addressInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
    instructionsInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, minHeight: 60, textAlignVertical: 'top' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
    totalText: { fontSize: 18, fontWeight: 'bold' },
    totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B' },
    placeOrderButton: { backgroundColor: '#FF6B6B', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    placeOrderText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CheckoutScreen;