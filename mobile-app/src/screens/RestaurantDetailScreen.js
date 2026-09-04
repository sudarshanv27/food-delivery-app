import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView
} from 'react-native';
import { useCart } from '../context/CartContext';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const { addToCart, getItemCount } = useCart();
  const [menuItems] = useState([
    { id: '101', name: 'Margherita Pizza', price: 299, description: 'Classic cheese pizza with tomato sauce', isVeg: true },
    { id: '102', name: 'Pepperoni Pizza', price: 399, description: 'Spicy pepperoni with extra cheese', isVeg: false },
    { id: '103', name: 'Garlic Bread', price: 99, description: 'Crispy garlic bread with butter', isVeg: true },
    { id: '104', name: 'French Fries', price: 89, description: 'Crispy golden fries with seasoning', isVeg: true },
    { id: '105', name: 'Chicken Wings', price: 249, description: 'Spicy chicken wings with dip', isVeg: false },
  ]);

  const handleAddToCart = (item) => {
    addToCart(item, restaurant);
    Alert.alert('Added to Cart', `${item.name} added to your cart!`);
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View style={styles.menuInfo}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuName}>{item.name}</Text>
          <Text style={styles.menuPrice}>₹{item.price}</Text>
        </View>
        <Text style={styles.menuDesc}>{item.description}</Text>
        <Text style={[styles.vegBadge, item.isVeg ? styles.veg : styles.nonVeg]}>
          {item.isVeg ? '🌱 Veg' : '🍖 Non-Veg'}
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
        <Text style={styles.addButtonText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.address}>{restaurant.address || 'MG Road, Bangalore'}</Text>
          <View style={styles.stats}>
            <Text style={styles.rating}>⭐ {restaurant.avg_rating}</Text>
            <Text style={styles.time}>🕒 {restaurant.estimated_delivery_time || 30} min</Text>
            <Text style={styles.fee}>🚚 ₹{restaurant.delivery_fee}</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>📋 Menu</Text>
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id}
          renderItem={renderMenuItem}
          scrollEnabled={false}
        />
      </ScrollView>
      
      {getItemCount() > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>
            🛒 View Cart ({getItemCount()} items)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 15,
  },
  rating: {
    fontSize: 14,
    color: '#ffa502',
  },
  time: {
    fontSize: 14,
    color: '#2ed573',
  },
  fee: {
    fontSize: 14,
    color: '#ff4757',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    margin: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  menuInfo: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  menuDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  vegBadge: {
    fontSize: 10,
    marginTop: 6,
  },
  veg: {
    color: '#2ed573',
  },
  nonVeg: {
    color: '#ff4757',
  },
  addButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#2ed573',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RestaurantDetailScreen;