// delivery-app/src/screens/EarningsScreen.js

import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';

const EarningsScreen = () => {
    // ================= DEMO EARNINGS =================
    const earnings = {
        today: 450,
        week: 2850,
        month: 12450,
        total: 45670,
    };

    // ================= DEMO TRANSACTIONS =================
    const transactions = [
        {
            id: 'ORD001',
            amount: 65,
            date: '15 May 2026',
        },
        {
            id: 'ORD002',
            amount: 50,
            date: '14 May 2026',
        },
        {
            id: 'ORD003',
            amount: 75,
            date: '13 May 2026',
        },
    ];

    // ================= WITHDRAW =================
    const handleWithdraw = () => {
        Alert.alert(
            'Withdraw Earnings',
            `Withdraw ₹${earnings.total} to your bank account?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Withdraw',
                    onPress: () =>
                        Alert.alert(
                            'Success',
                            'Withdrawal request submitted!'
                        ),
                },
            ]
        );
    };

    return (
        <ScrollView
            style={styles.container}
        >
            {/* ================= HEADER ================= */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    💰 Total Earnings
                </Text>

                <Text style={styles.totalAmount}>
                    ₹{earnings.total}
                </Text>

                <Text style={styles.subText}>
                    Lifetime Earnings
                </Text>
            </View>

            {/* ================= STATS ================= */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        ₹{earnings.today}
                    </Text>

                    <Text style={styles.statLabel}>
                        Today
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        ₹{earnings.week}
                    </Text>

                    <Text style={styles.statLabel}>
                        This Week
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        ₹{earnings.month}
                    </Text>

                    <Text style={styles.statLabel}>
                        This Month
                    </Text>
                </View>
            </View>

            {/* ================= TRANSACTIONS ================= */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Recent Transactions
                </Text>

                {transactions.map(
                    (item) => (
                        <View
                            key={item.id}
                            style={
                                styles.transactionCard
                            }
                        >
                            <View>
                                <Text
                                    style={
                                        styles.orderId
                                    }
                                >
                                    {item.id}
                                </Text>

                                <Text
                                    style={
                                        styles.transactionDate
                                    }
                                >
                                    {item.date}
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.amount
                                }
                            >
                                +₹{item.amount}
                            </Text>
                        </View>
                    )
                )}
            </View>

            {/* ================= WITHDRAW BUTTON ================= */}
            <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={handleWithdraw}
            >
                <Text
                    style={
                        styles.withdrawText
                    }
                >
                    Withdraw Earnings
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default EarningsScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },

    header: {
        backgroundColor: '#ff4757',
        padding: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },

    headerTitle: {
        fontSize: 18,
        color: '#fff',
    },

    totalAmount: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
    },

    subText: {
        color: '#fff',
        marginTop: 5,
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 15,
    },

    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 5,
        padding: 15,
        borderRadius: 14,
        alignItems: 'center',
        elevation: 3,
    },

    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff4757',
    },

    statLabel: {
        marginTop: 6,
        color: '#666',
        fontSize: 13,
    },

    section: {
        margin: 15,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 15,
        elevation: 2,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },

    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    orderId: {
        fontSize: 15,
        fontWeight: 'bold',
    },

    transactionDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 3,
    },

    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2ed573',
    },

    withdrawBtn: {
        margin: 20,
        backgroundColor: '#ff4757',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },

    withdrawText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});