import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';

const CartIcon = ({ itemCount = 0, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.cartEmoji}>🛒</Text>
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const FloatingCartButton = ({ itemCount, total, onPress }) => {
  if (itemCount === 0) return null;

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <View style={styles.floatingContent}>
        <Text style={styles.floatingEmoji}>🛒</Text>
        <Text style={styles.floatingCount}>{itemCount}</Text>
        <View style={styles.floatingDivider} />
        <Text style={styles.floatingTotal}>₹{total || 0}</Text>
        <Text style={styles.floatingText}>View Cart</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  cartEmoji: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ff4757',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingEmoji: {
    fontSize: 20,
  },
  floatingCount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  floatingDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  floatingTotal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  floatingText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CartIcon;