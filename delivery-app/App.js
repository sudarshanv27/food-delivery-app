// delivery-app/App.js

import 'react-native-gesture-handler';

import React, { useState, useEffect } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    SafeAreaView,
    StatusBar,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// ================= API =================
const API_URL = 'http://10.0.2.2:5000/api';

// ================= LOGIN SCREEN =================
const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (
            email === 'delivery@foodapp.com' &&
            password === 'delivery123'
        ) {
            Alert.alert('Success', 'Login successful');

            navigation.replace('Main');
        } else {
            Alert.alert(
                'Invalid Login',
                'Use:\ndelivery@foodapp.com\nPassword: delivery123'
            );
        }
    };

    return (
        <SafeAreaView style={styles.loginContainer}>
            <StatusBar barStyle="light-content" />

            <View style={styles.loginCard}>
                <Text style={styles.loginTitle}>
                    🛵 FoodieDash Delivery
                </Text>

                <Text style={styles.loginSubtitle}>
                    Delivery Partner Login
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleLogin}
                >
                    <Text style={styles.primaryButtonText}>
                        Login
                    </Text>
                </TouchableOpacity>

                <Text style={styles.demoText}>
                    Demo Login:
                </Text>

                <Text style={styles.demoText}>
                    delivery@foodapp.com
                </Text>

                <Text style={styles.demoText}>
                    delivery123
                </Text>
            </View>
        </SafeAreaView>
    );
};

// ================= ORDER LIST =================
const OrderListScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = () => {
        const demoOrders = [
            {
                id: 'ORD001',
                customer: 'John Doe',
                restaurant: 'Pizza Paradise',
                address: 'Indiranagar, Bangalore',
                total: 443,
                distance: '2.5 km',
                items: 'Pizza + Garlic Bread',
            },
            {
                id: 'ORD002',
                customer: 'Jane Smith',
                restaurant: 'Burger Hub',
                address: 'Koramangala, Bangalore',
                total: 527,
                distance: '3.1 km',
                items: 'Burger + Fries',
            },
        ];

        setOrders(demoOrders);
        setLoading(false);
    };

    const acceptOrder = (order) => {
        navigation.navigate('Tracking', {
            order,
        });
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color="#ff4757"
                />
            </View>
        );
    }

    return (
        <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
                padding: 15,
            }}
            renderItem={({ item }) => (
                <View style={styles.orderCard}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.orderId}>
                            #{item.id}
                        </Text>

                        <Text style={styles.distance}>
                            📍 {item.distance}
                        </Text>
                    </View>

                    <Text style={styles.restaurant}>
                        🍕 {item.restaurant}
                    </Text>

                    <Text style={styles.text}>
                        👤 {item.customer}
                    </Text>

                    <Text style={styles.text}>
                        🚚 {item.address}
                    </Text>

                    <Text style={styles.text}>
                        🍽️ {item.items}
                    </Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.total}>
                            ₹{item.total}
                        </Text>

                        <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() =>
                                acceptOrder(item)
                            }
                        >
                            <Text
                                style={styles.acceptBtnText}
                            >
                                Accept
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        />
    );
};

// ================= TRACKING =================
const TrackingScreen = ({ route, navigation }) => {
    const { order } = route.params;

    const [status, setStatus] =
        useState('accepted');

    const updateStatus = (newStatus) => {
        setStatus(newStatus);

        if (newStatus === 'delivered') {
            Alert.alert(
                'Delivered',
                'Order delivered successfully',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            navigation.goBack(),
                    },
                ]
            );
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.trackingCard}>
                <Text style={styles.trackingTitle}>
                    Order #{order.id}
                </Text>

                <Text style={styles.text}>
                    🍕 {order.restaurant}
                </Text>

                <Text style={styles.text}>
                    👤 {order.customer}
                </Text>

                <Text style={styles.text}>
                    📍 {order.address}
                </Text>

                <Text style={styles.total}>
                    ₹{order.total}
                </Text>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.status}>
                        Current Status:
                    </Text>

                    <Text style={styles.statusValue}>
                        {status.toUpperCase()}
                    </Text>
                </View>

                {status === 'accepted' && (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() =>
                            updateStatus(
                                'picked_up'
                            )
                        }
                    >
                        <Text
                            style={
                                styles.primaryButtonText
                            }
                        >
                            Mark Picked Up
                        </Text>
                    </TouchableOpacity>
                )}

                {status === 'picked_up' && (
                    <TouchableOpacity
                        style={styles.successButton}
                        onPress={() =>
                            updateStatus(
                                'delivered'
                            )
                        }
                    >
                        <Text
                            style={
                                styles.primaryButtonText
                            }
                        >
                            Mark Delivered
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

// ================= EARNINGS =================
const EarningsScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.earningsCard}>
                <Text style={styles.earningsTitle}>
                    Today's Earnings
                </Text>

                <Text style={styles.earningsAmount}>
                    ₹450
                </Text>

                <Text style={styles.earningsSub}>
                    5 deliveries completed
                </Text>
            </View>

            <View style={styles.statRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        ₹2,850
                    </Text>

                    <Text style={styles.statLabel}>
                        This Week
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        ₹12,450
                    </Text>

                    <Text style={styles.statLabel}>
                        This Month
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

// ================= MAIN TABS =================
const MainScreen = ({ navigation }) => {
    const [tab, setTab] =
        useState('orders');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    🛵 Delivery Partner
                </Text>

                <View style={styles.onlineBadge}>
                    <Text
                        style={styles.onlineText}
                    >
                        ● Online
                    </Text>
                </View>
            </View>

            <View style={{ flex: 1 }}>
                {tab === 'orders' ? (
                    <OrderListScreen
                        navigation={navigation}
                    />
                ) : (
                    <EarningsScreen />
                )}
            </View>

            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() =>
                        setTab('orders')
                    }
                >
                    <Text style={styles.navText}>
                        📋 Orders
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() =>
                        setTab('earnings')
                    }
                >
                    <Text style={styles.navText}>
                        💰 Earnings
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// ================= APP =================
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                />

                <Stack.Screen
                    name="Main"
                    component={MainScreen}
                />

                <Stack.Screen
                    name="Tracking"
                    component={TrackingScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff4757',
        padding: 20,
    },

    loginCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
    },

    loginTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ff4757',
        textAlign: 'center',
    },

    loginSubtitle: {
        textAlign: 'center',
        marginVertical: 15,
        color: '#777',
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 14,
        marginBottom: 15,
    },

    primaryButton: {
        backgroundColor: '#ff4757',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },

    successButton: {
        backgroundColor: '#2ed573',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },

    primaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    demoText: {
        textAlign: 'center',
        marginTop: 10,
        color: '#666',
        fontSize: 12,
    },

    header: {
        backgroundColor: '#ff4757',
        padding: 20,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },

    onlineBadge: {
        backgroundColor: '#2ed573',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    onlineText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    orderId: {
        fontWeight: 'bold',
        color: '#ff4757',
    },

    restaurant: {
        fontSize: 17,
        fontWeight: 'bold',
        marginVertical: 6,
    },

    text: {
        color: '#666',
        marginBottom: 5,
    },

    total: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
    },

    distance: {
        color: '#555',
    },

    acceptBtn: {
        backgroundColor: '#2ed573',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
    },

    acceptBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    trackingCard: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 20,
        borderRadius: 16,
    },

    trackingTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    status: {
        fontSize: 15,
        color: '#666',
    },

    statusValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff4757',
        marginTop: 5,
    },

    earningsCard: {
        backgroundColor: '#ff4757',
        margin: 15,
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
    },

    earningsTitle: {
        color: '#fff',
        fontSize: 16,
    },

    earningsAmount: {
        color: '#fff',
        fontSize: 42,
        fontWeight: 'bold',
        marginVertical: 10,
    },

    earningsSub: {
        color: '#fff',
    },

    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },

    statCard: {
        backgroundColor: '#fff',
        width: '42%',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },

    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ff4757',
    },

    statLabel: {
        color: '#777',
        marginTop: 6,
    },

    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#eee',
    },

    navBtn: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },

    navText: {
        fontWeight: 'bold',
        color: '#555',
    },
});