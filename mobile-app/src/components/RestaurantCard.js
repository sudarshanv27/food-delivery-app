import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';

const RestaurantCard = ({ restaurant, onPress }) => {
  const {
    name,
    cuisine_types,
    avg_rating,
    delivery_fee,
    min_order_amount,
    estimated_delivery_time,
    logo_url,
    is_open
  } = restaurant;

  return (
    <TouchableOpacity
      style={[styles.card, !is_open && styles.closedCard]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: logo_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop' }}
          style={styles.image}
        />
        {!is_open && (
          <View style={styles.closedBadge}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {avg_rating || 'New'}</Text>
          </View>
        </View>

        <Text style={styles.cuisine} numberOfLines={1}>
          {cuisine_types || 'Various Cuisines'}
        </Text>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>🕒 {estimated_delivery_time || 30} min</Text>
          <Text style={styles.detailText}>🚚 ₹{delivery_fee || 29}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.minOrder}>Min order: ₹{min_order_amount || 99}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  closedCard: {
    opacity: 0.7,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  closedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ff4757',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  closedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffa502',
  },
  cuisine: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  footerRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  minOrder: {
    fontSize: 12,
    color: '#999',
  },
});

export default RestaurantCard;