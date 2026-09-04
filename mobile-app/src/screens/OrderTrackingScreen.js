import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import api from '../services/api';
import { initializeSocket, joinOrderRoom, onLocationUpdate, disconnectSocket } from '../services/socket';

const OrderTrackingScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    setupSocket();
    
    return () => {
      disconnectSocket();
    };
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.order);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const socket = initializeSocket();
    joinOrderRoom(orderId);
    
    onLocationUpdate((data) => {
      setCurrentLocation(data);
    });
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    return steps.indexOf(status);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '🍳';
      case 'out_for_delivery': return '🚚';
      case 'delivered': return '🎉';
      default: return '📋';
    }
  };

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const currentStep = getStatusStep(order?.order_status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <Text style={styles.orderNumber}>Order #{order?.order_number}</Text>
      </View>

      <View style={styles.timeline}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.timelineStep}>
            <View style={styles.timelineIconContainer}>
              <View style={[
                styles.timelineIcon,
                currentStep >= index && styles.timelineIconActive
              ]}>
                <Text style={styles.timelineIconText}>
                  {currentStep >= index ? '✓' : index + 1}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  currentStep > index && styles.timelineLineActive
                ]} />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[
                styles.timelineLabel,
                currentStep >= index && styles.timelineLabelActive
              ]}>
                {step.label}
              </Text>
              {currentStep === index && (
                <Text style={styles.timelineStatus}>
                  {getStatusIcon(order?.order_status)} In Progress
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.deliveryInfo}>
        <Text style={styles.infoTitle}>Delivery Address</Text>
        <Text style={styles.infoText}>{order?.delivery_address}</Text>
        
        <Text style={[styles.infoTitle, { marginTop: 15 }]}>Payment Method</Text>
        <Text style={styles.infoText}>
          {order?.payment_method === 'cash' ? 'Cash on Delivery' : 'Credit Card'}
        </Text>
        
        <Text style={[styles.infoTitle, { marginTop: 15 }]}>Total Amount</Text>
        <Text style={styles.totalAmount}>₿{parseFloat(order?.total_amount).toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderNumber: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  timeline: {
    padding: 20,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIconContainer: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineIconActive: {
    backgroundColor: '#4CAF50',
  },
  timelineIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineLine: {
    position: 'absolute',
    top: 32,
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  timelineLineActive: {
    backgroundColor: '#4CAF50',
  },
  timelineContent: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 10,
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  timelineLabelActive: {
    color: '#333',
  },
  timelineStatus: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  deliveryInfo: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});

export default OrderTrackingScreen;