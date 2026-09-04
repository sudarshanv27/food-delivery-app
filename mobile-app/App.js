import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';

// Simple API service
const API_URL = 'http://10.0.2.2:5000/api'; // For Android emulator
// For physical device, use your computer's IP: 'http://192.168.1.100:5000/api'

const App = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('home'); // home, restaurant, cart

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      // Demo data instead of API call for now
      const demoRestaurants = [
        {
          id: '1',
          name: 'Pizza Paradise',
          cuisine: 'Italian, Pizza',
          rating: 4.5,
          deliveryFee: 2.99,
          minOrder: 200,
          deliveryTime: 30,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop'
        },
        {
          id: '2',
          name: 'Burger Hub',
          cuisine: 'American, Burgers',
          rating: 4.3,
          deliveryFee: 1.99,
          minOrder: 150,
          deliveryTime: 25,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop'
        },
        {
          id: '3',
          name: 'Sushi Master',
          cuisine: 'Japanese, Sushi',
          rating: 4.7,
          deliveryFee: 3.99,
          minOrder: 300,
          deliveryTime: 40,
          image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=200&fit=crop'
        },
        {
          id: '4',
          name: 'Taco Fiesta',
          cuisine: 'Mexican',
          rating: 4.2,
          deliveryFee: 1.49,
          minOrder: 180,
          deliveryTime: 35,
          image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=300&h=200&fit=crop'
        },
        {
          id: '5',
          name: 'Chinese Wok',
          cuisine: 'Chinese, Asian',
          rating: 4.4,
          deliveryFee: 2.49,
          minOrder: 200,
          deliveryTime: 35,
          image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&h=200&fit=crop'
        },
      ];

      setRestaurants(demoRestaurants);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = {
    '1': [
      { id: '101', name: 'Margherita Pizza', price: 299, description: 'Classic cheese pizza', isVeg: true },
      { id: '102', name: 'Pepperoni Pizza', price: 399, description: 'Spicy pepperoni', isVeg: false },
      { id: '103', name: 'Garlic Bread', price: 99, description: 'Crispy garlic bread', isVeg: true },
    ],
    '2': [
      { id: '201', name: 'Classic Burger', price: 199, description: 'Beef patty with lettuce', isVeg: false },
      { id: '202', name: 'Chicken Burger', price: 179, description: 'Grilled chicken', isVeg: false },
      { id: '203', name: 'French Fries', price: 89, description: 'Crispy fries', isVeg: true },
    ],
    '3': [
      { id: '301', name: 'California Roll', price: 349, description: 'Crab, avocado, cucumber', isVeg: false },
      { id: '302', name: 'Salmon Nigiri', price: 299, description: 'Fresh salmon', isVeg: false },
      { id: '303', name: 'Miso Soup', price: 99, description: 'Traditional soup', isVeg: true },
    ],
  };

  const addToCart = (item, restaurant) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, restaurantName: restaurant.name, restaurantId: restaurant.id }]);
    }
    Alert.alert('Added to Cart', `${item.name} added to your cart!`);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = () => {
    Alert.alert(
      'Order Placed!',
      `Your order has been placed successfully!\nTotal: ₹${getCartTotal()}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setCart([]);
            setView('home');
          }
        }
      ]
    );
  };

  const RestaurantCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedRestaurant(item);
        setView('restaurant');
      }}
    >
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardCuisine}>{item.cuisine}</Text>
      <View style={styles.cardDetails}>
        <Text style={styles.cardRating}>⭐ {item.rating}</Text>
        <Text style={styles.cardTime}>⏱️ {item.deliveryTime} min</Text>
        <Text style={styles.cardFee}>🚚 ₹{item.deliveryFee}</Text>
      </View>
      <Text style={styles.cardMinOrder}>Min order: ₹{item.minOrder}</Text>
    </TouchableOpacity>
  );

  const HomeScreen = () => (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>🍕 Food Delivery</Text>
        <Text style={styles.heroSubtitle}>Delicious food delivered to your doorstep</Text>
      </View>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantCard item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </>
  );

  const RestaurantScreen = () => (
    <ScrollView style={styles.restaurantContainer}>
      <TouchableOpacity onPress={() => setView('home')} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.restaurantName}>{selectedRestaurant?.name}</Text>
      <Text style={styles.restaurantCuisine}>{selectedRestaurant?.cuisine}</Text>

      <Text style={styles.menuTitle}>Menu</Text>
      {menuItems[selectedRestaurant?.id]?.map((item) => (
        <View key={item.id} style={styles.menuItem}>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemName}>
              {item.name} {item.isVeg && '🌱'}
            </Text>
            <Text style={styles.menuItemDesc}>{item.description}</Text>
            <Text style={styles.menuItemPrice}>₹{item.price}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToCart(item, selectedRestaurant)}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      ))}

      {cart.length > 0 && (
        <TouchableOpacity style={styles.viewCartButton} onPress={() => setView('cart')}>
          <Text style={styles.viewCartText}>🛒 View Cart ({cart.length} items)</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const CartScreen = () => (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => setView('restaurant')} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back to Menu</Text>
      </TouchableOpacity>

      <Text style={styles.cartTitle}>Your Cart</Text>

      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartEmoji}>🛒</Text>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => setView('home')}>
            <Text style={styles.shopButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemRestaurant}>{item.restaurantName}</Text>
                <Text style={styles.cartItemPrice}>₹{item.price} each</Text>
              </View>
              <View style={styles.cartItemControls}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Text style={styles.qtyButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Text style={styles.qtyButton}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cartItemTotal}>₹{item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ₹{getCartTotal()}</Text>
            <TouchableOpacity style={styles.orderButton} onPress={placeOrder}>
              <Text style={styles.orderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff4757" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {view === 'home' && <HomeScreen />}
      {view === 'restaurant' && <RestaurantScreen />}
      {view === 'cart' && <CartScreen />}
    </View>
  );
};

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
  hero: {
    backgroundColor: '#ff4757',
    padding: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardCuisine: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardDetails: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  cardRating: {
    fontSize: 12,
    color: '#ffa502',
  },
  cardTime: {
    fontSize: 12,
    color: '#2ed573',
  },
  cardFee: {
    fontSize: 12,
    color: '#ff4757',
  },
  cardMinOrder: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
  restaurantContainer: {
    flex: 1,
    padding: 15,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ff4757',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4757',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  viewCartButton: {
    backgroundColor: '#2ed573',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  viewCartText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cartItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  cartItemInfo: {
    marginBottom: 8,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemRestaurant: {
    fontSize: 12,
    color: '#999',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  qtyButton: {
    width: 30,
    height: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    color: '#ff4757',
    fontSize: 12,
    marginLeft: 10,
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
    textAlign: 'right',
  },
  totalContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderButton: {
    backgroundColor: '#ff4757',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  orderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyCart: {
    alignItems: 'center',
    padding: 50,
  },
  emptyCartEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
// mobile-app/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import OffersScreen from './src/screens/OffersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Orders') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'Offers') iconName = focused ? 'pricetag' : 'pricetag-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#ff6b35',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Orders" component={OrderHistoryScreen} />
            <Tab.Screen name="Offers" component={OffersScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Auth Navigator
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
}

// Main App Navigator
function AppNavigator() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null; // Or a splash screen
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}

// Main App
export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}