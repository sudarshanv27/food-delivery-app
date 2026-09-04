import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal
} from 'react-native';

const Loader = ({ visible, text = 'Loading...', fullScreen = true }) => {
  if (!visible) return null;

  if (fullScreen) {
    return (
      <Modal transparent={true} animationType="fade" visible={visible}>
        <View style={styles.modalContainer}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ff4757" />
            <Text style={styles.loaderText}>{text}</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="small" color="#ff4757" />
      <Text style={styles.inlineText}>{text}</Text>
    </View>
  );
};

export const ListSkeleton = ({ count = 3 }) => {
  return (
    <View style={skeletonStyles.container}>
      {[...Array(count)].map((_, index) => (
        <View key={index} style={skeletonStyles.card}>
          <View style={skeletonStyles.image} />
          <View style={skeletonStyles.content}>
            <View style={skeletonStyles.title} />
            <View style={skeletonStyles.subtitle} />
            <View style={skeletonStyles.details} />
            <View style={skeletonStyles.footer} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#2c3e50',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  inlineText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 12,
  },
  title: {
    height: 20,
    width: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    height: 14,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  details: {
    height: 12,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  footer: {
    height: 12,
    width: '40%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default Loader;