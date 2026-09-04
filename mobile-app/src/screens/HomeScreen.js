// mobile-app/src/screens/HomeScreen.js

import React, { useState, useEffect, useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
  Animated
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';

import * as Location from 'expo-location';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import PushNotification from 'react-native-push-notification';

import { useFocusEffect } from '@react-navigation/native';

import io from 'socket.io-client';

import api from '../services/api';

const socket = io('http://localhost:5000');

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {

  // ================= STATES =================
  const [restaurants, setRestaurants] = useState([]);

  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);

  const [userLocation, setUserLocation] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [selectedCuisine, setSelectedCuisine] = useState('all');

  const [sortBy, setSortBy] = useState('rating');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ================= FETCH DATA =================
  useEffect(() => {

    fetchRestaurants();

    getLocation();

    setupPushNotifications();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();

  }, []);

  // ================= GET LOCATION =================
  const getLocation = async () => {

    try {

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({});

      setUserLocation(location.coords);

      fetchNearbyRestaurants(location.coords);

    } catch (error) {

      console.log(error);

    }

  };

  // ================= PUSH NOTIFICATIONS =================
  const setupPushNotifications = () => {

    PushNotification.configure({

      onNotification: function (notification) {

        console.log('Notification:', notification);

        if (notification?.data?.orderId) {

          navigation.navigate('OrderTracking', {
            orderId: notification.data.orderId
          });

        }

      },

      popInitialNotification: true,

      requestPermissions: true

    });

  };

  // ================= FETCH RESTAURANTS =================
  const fetchRestaurants = async () => {

    try {

      setLoading(true);

      const response = await api.get('/restaurants');

      setRestaurants(response.data.restaurants);

    } catch (error) {

      console.log('API Error:', error);

      // ================= DEMO DATA =================
      setRestaurants([
        {
          restaurant_id: '1',
          name: 'Pizza Paradise',
          cuisine_types: 'Italian, Pizza',
          avg_rating: 4.5,
          delivery_fee: 2.99,
          min_order_amount: 200,
          estimated_delivery_time: 30,
          logo_url:
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
          latitude: 12.9716,
          longitude: 77.5946
        },
        {
          restaurant_id: '2',
          name: 'Burger Hub',
          cuisine_types: 'American, Burgers',
          avg_rating: 4.3,
          delivery_fee: 1.99,
          min_order_amount: 150,
          estimated_delivery_time: 25,
          logo_url:
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
          latitude: 12.975,
          longitude: 77.599
        }
      ]);

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };

  // ================= FETCH NEARBY RESTAURANTS =================
  const fetchNearbyRestaurants = async (coords) => {

    try {

      const response = await api.get('/restaurants/nearby', {
        params: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      });

      setNearbyRestaurants(response.data.restaurants);

    } catch (error) {

      console.log('Nearby Error:', error);

    }

  };

  // ================= REFRESH =================
  const onRefresh = () => {

    setRefreshing(true);

    fetchRestaurants();

  };

  // ================= CUISINES =================
  const cuisines = [
    'All',
    'Italian',
    'Chinese',
    'Mexican',
    'Japanese',
    'Indian'
  ];

  // ================= FILTER + SORT =================
  const filteredRestaurants = restaurants
    .filter((restaurant) => {

      if (selectedCuisine === 'all') return true;

      return restaurant.cuisine_types
        ?.toLowerCase()
        .includes(selectedCuisine.toLowerCase());

    })
    .sort((a, b) => {

      if (sortBy === 'rating') {
        return b.avg_rating - a.avg_rating;
      }

      if (sortBy === 'deliveryTime') {
        return (
          a.estimated_delivery_time -
          b.estimated_delivery_time
        );
      }

      return 0;

    });

  // ================= RENDER RESTAURANT =================
  const renderRestaurant = ({ item }) => (

    <Animated.View style={{ opacity: fadeAnim }}>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('RestaurantDetail', {
            restaurant: item
          })
        }
      >

        <Image
          source={{ uri: item.logo_url }}
          style={styles.image}
        />

        <View style={styles.cardContent}>

          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.cuisine}>
            {item.cuisine_types}
          </Text>

          <View style={styles.details}>

            <Text style={styles.rating}>
              ⭐ {item.avg_rating}
            </Text>

            <Text style={styles.delivery}>
              🚚 ₹{item.delivery_fee}
            </Text>

            <Text style={styles.minOrder}>
              ⏱ {item.estimated_delivery_time} mins
            </Text>

          </View>

        </View>

      </TouchableOpacity>

    </Animated.View>

  );

  // ================= LOADING =================
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

  // ================= MAIN UI =================
  return (

    <View style={styles.container}>

      {/* ================= HEADER ================= */}
      <View style={styles.header}>

        <View>

          <Text style={styles.locationLabel}>
            Delivering To
          </Text>

          <TouchableOpacity>

            <Text style={styles.locationAddress}>
              📍
              {userLocation
                ? ' Current Location'
                : ' Select Address'}
            </Text>

          </TouchableOpacity>

        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
        >

          <View style={styles.cartBadge}>

            <Text style={styles.cartCount}>
              🛒
            </Text>

          </View>

        </TouchableOpacity>

      </View>

      {/* ================= SEARCH ================= */}
      <GooglePlacesAutocomplete
        placeholder="Search restaurants..."
        fetchDetails={true}
        onPress={(data, details = null) => {
          console.log(data, details);
        }}
        query={{
          key: 'YOUR_GOOGLE_PLACES_API_KEY',
          language: 'en',
          components: 'country:in'
        }}
        styles={{
          textInput: styles.searchInput
        }}
      />

      {/* ================= CUISINE FILTER ================= */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={cuisines}
        keyExtractor={(item) => item}
        style={styles.cuisineList}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              styles.cuisineChip,
              selectedCuisine === item.toLowerCase() &&
              styles.cuisineChipActive
            ]}
            onPress={() =>
              setSelectedCuisine(item.toLowerCase())
            }
          >

            <Text
              style={[
                styles.cuisineText,
                selectedCuisine === item.toLowerCase() &&
                styles.cuisineTextActive
              ]}
            >
              {item}
            </Text>

          </TouchableOpacity>

        )}
      />

      {/* ================= SORT OPTIONS ================= */}
      <View style={styles.sortContainer}>

        <TouchableOpacity
          onPress={() => setSortBy('rating')}
        >
          <Text
            style={[
              styles.sortOption,
              sortBy === 'rating' &&
              styles.sortActive
            ]}
          >
            ⭐ Top Rated
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSortBy('deliveryTime')}
        >
          <Text
            style={[
              styles.sortOption,
              sortBy === 'deliveryTime' &&
              styles.sortActive
            ]}
          >
            🚚 Fast Delivery
          </Text>
        </TouchableOpacity>

      </View>

      {/* ================= RESTAURANTS ================= */}
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.restaurant_id}
        renderItem={renderRestaurant}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />

      {/* ================= MAP ================= */}
      {nearbyRestaurants.length > 0 && (

        <View style={styles.mapContainer}>

          <Text style={styles.mapTitle}>
            Nearby Restaurants 📍
          </Text>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude:
                userLocation?.latitude || 12.9716,
              longitude:
                userLocation?.longitude || 77.5946,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            }}
          >

            {nearbyRestaurants.map((restaurant) => (

              <Marker
                key={restaurant.restaurant_id}
                coordinate={{
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude
                }}
                title={restaurant.name}
              />

            ))}

          </MapView>

        </View>

      )}

    </View>

  );

};

// ================= STYLES =================
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },

  locationLabel: {
    fontSize: 12,
    color: '#777'
  },

  locationAddress: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  cartBadge: {
    backgroundColor: '#ff4757',
    padding: 10,
    borderRadius: 50
  },

  cartCount: {
    color: '#fff',
    fontSize: 18
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15
  },

  cuisineList: {
    marginBottom: 15
  },

  cuisineChip: {
    backgroundColor: '#eee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10
  },

  cuisineChipActive: {
    backgroundColor: '#ff4757'
  },

  cuisineText: {
    color: '#333'
  },

  cuisineTextActive: {
    color: '#fff'
  },

  sortContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15
  },

  sortOption: {
    color: '#666'
  },

  sortActive: {
    color: '#ff4757',
    fontWeight: 'bold'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3
  },

  image: {
    width: '100%',
    height: 180
  },

  cardContent: {
    padding: 12
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },

  cuisine: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },

  rating: {
    color: '#ffa502'
  },

  delivery: {
    color: '#2ed573'
  },

  minOrder: {
    color: '#999'
  },

  mapContainer: {
    marginTop: 20
  },

  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },

  map: {
    width: '100%',
    height: 250,
    borderRadius: 12
  }

});

export default HomeScreen;
// mobile-app/src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/restaurants');
            if (response.data.success) {
                setRestaurants(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRestaurants = restaurants.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase())
    );

    const renderRestaurant = ({ item }) => (
        <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
        >
            <View style={styles.restaurantImage}>
                <Text style={styles.imageEmoji}>🏪</Text>
            </View>
            <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.cuisine}>{Array.isArray(item.cuisine_types) ? item.cuisine_types.join(', ') : item.cuisine_types || 'Various'}</Text>
                <View style={styles.restaurantMeta}>
                    <Text style={styles.rating}>⭐ {item.rating || 4.5}</Text>
                    <Text style={styles.time}>⏱️ {item.delivery_time || 30} min</Text>
                    <Text style={styles.fee}>🚚 ₹{item.delivery_fee || 29}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6b35" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Delicious Food</Text>
                <Text style={styles.headerSubtitle}>Delivered to your doorstep</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Search restaurants..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={filteredRestaurants}
                renderItem={renderRestaurant}
                keyExtractor={(item) => item.id || item.restaurant_id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, backgroundColor: '#ff6b35', paddingTop: 50 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 14, color: 'white', marginTop: 5, opacity: 0.9 },
    searchContainer: { padding: 15, backgroundColor: 'white' },
    searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 25, padding: 12, paddingHorizontal: 20, fontSize: 16 },
    listContainer: { padding: 15 },
    restaurantCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, marginBottom: 15, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 },
    restaurantImage: { width: 100, height: 100, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
    imageEmoji: { fontSize: 40 },
    restaurantInfo: { flex: 1, padding: 12 },
    restaurantName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cuisine: { fontSize: 14, color: '#666', marginTop: 4 },
    restaurantMeta: { flexDirection: 'row', marginTop: 8, gap: 12 },
    rating: { fontSize: 12, color: '#666' },
    time: { fontSize: 12, color: '#666' },
    fee: { fontSize: 12, color: '#666' },
});