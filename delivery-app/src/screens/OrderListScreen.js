// delivery-app/src/screens/OrderListScreen.js

import React, {
    useState,
    useEffect,
} from 'react';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';

const OrderListScreen = ({
    navigation,
}) => {
    // ================= STATES =================
    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    // ================= LOAD ORDERS =================
    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = () => {
        const demoOrders = [
            {
                id: 'ORD001',
                customer:
                    'Rahul Sharma',
                restaurant:
                    'Pizza Paradise',
                address:
                    'Indiranagar, Bangalore',
                total: 443,
                distance: '2.5 km',
                deliveryFee: 45,
            },
            {
                id: 'ORD002',
                customer: 'Priya',
                restaurant:
                    'Burger Hub',
                address:
                    'Koramangala, Bangalore',
                total: 527,
                distance: '3.1 km',
                deliveryFee: 50,
            },
            {
                id: 'ORD003',
                customer: 'Aman',
                restaurant:
                    'South Indian Delight',
                address:
                    'Whitefield, Bangalore',
                total: 389,
                distance: '1.8 km',
                deliveryFee: 40,
            },
        ];

        setOrders(demoOrders);
        setLoading(false);
    };

    // ================= ACCEPT ORDER =================
    const acceptOrder = (
        order
    ) => {
        Alert.alert(
            'Accept Order',
            `Accept Order #${order.id}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Accept',
                    onPress: () =>
                        navigation?.navigate(
                            'DeliveryTracking',
                            { order }
                        ),
                },
            ]
        );
    };

    // ================= LOADING =================
    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator
                    size="large"
                    color="#ff4757"
                />

                <Text
                    style={{
                        marginTop: 10,
                    }}
                >
                    Loading Orders...
                </Text>
            </View>
        );
    }

    // ================= ORDER CARD =================
    const renderOrder = ({
        item,
    }) => (
        <View style={styles.card}>
            {/* HEADER */}
            <View
                style={styles.header}
            >
                <Text
                    style={styles.orderId}
                >
                    #{item.id}
                </Text>

                <Text
                    style={styles.distance}
                >
                    📍 {item.distance}
                </Text>
            </View>

            {/* DETAILS */}
            <Text
                style={
                    styles.restaurant
                }
            >
                🍕 {item.restaurant}
            </Text>

            <Text style={styles.info}>
                👤 {item.customer}
            </Text>

            <Text style={styles.info}>
                🏠 {item.address}
            </Text>

            {/* FOOTER */}
            <View
                style={styles.footer}
            >
                <View>
                    <Text
                        style={
                            styles.total
                        }
                    >
                        ₹{item.total}
                    </Text>

                    <Text
                        style={
                            styles.deliveryFee
                        }
                    >
                        Delivery Fee:
                        ₹
                        {
                            item.deliveryFee
                        }
                    </Text>
                </View>

                <TouchableOpacity
                    style={
                        styles.acceptBtn
                    }
                    onPress={() =>
                        acceptOrder(item)
                    }
                >
                    <Text
                        style={
                            styles.acceptText
                        }
                    >
                        Accept
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // ================= RETURN =================
    return (
        <View
            style={styles.container}
        >
            {/* HEADER */}
            <View
                style={styles.topBar}
            >
                <Text
                    style={styles.title}
                >
                    📦 Available Orders
                </Text>
            </View>

            {/* LIST */}
            <FlatList
                data={orders}
                keyExtractor={(item) =>
                    item.id
                }
                renderItem={renderOrder}
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
            />
        </View>
    );
};

export default OrderListScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            '#f5f5f5',
    },

    loader: {
        flex: 1,
        justifyContent:
            'center',
        alignItems: 'center',
    },

    topBar: {
        backgroundColor:
            '#ff4757',
        padding: 20,
        paddingTop: 50,
    },

    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },

    card: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 16,
        borderRadius: 16,
        elevation: 3,
    },

    header: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        marginBottom: 10,
    },

    orderId: {
        color: '#ff4757',
        fontWeight: 'bold',
        fontSize: 16,
    },

    distance: {
        color: '#777',
    },

    restaurant: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    info: {
        color: '#555',
        marginBottom: 5,
    },

    footer: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },

    total: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2ed573',
    },

    deliveryFee: {
        color: '#666',
        marginTop: 4,
    },

    acceptBtn: {
        backgroundColor:
            '#2ed573',
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 30,
    },

    acceptText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});