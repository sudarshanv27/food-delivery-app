import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { Camera } from 'expo-camera';

const QRScanner = ({ onScan, onClose, onError }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        if (onError) {
          onError('Camera permission denied');
        }
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to scan QR codes',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    
    try {
      const parsedData = JSON.parse(data);
      onScan(parsedData);
    } catch {
      onScan({ data, type });
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.scannerArea}>
            <View style={styles.scannerFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            <Text style={styles.scannerText}>
              Align QR code within the frame
            </Text>
          </View>

          {scanned && (
            <View style={styles.scannedOverlay}>
              <View style={styles.scannedContainer}>
                <Text style={styles.scannedIcon}>✓</Text>
                <Text style={styles.scannedTitle}>QR Code Scanned!</Text>
                <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
                  <Text style={styles.scanAgainText}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Camera>
    </View>
  );
};

export const QRScannerModal = ({ visible, onClose, onScan, onError }) => {
  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <QRScanner onScan={onScan} onClose={onClose} onError={onError} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconButton: {
    padding: 8,
  },
  closeIcon: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ff4757',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ff4757',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ff4757',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ff4757',
  },
  scannerText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
  },
  scannedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
  },
  scannedIcon: {
    fontSize: 40,
    color: '#2ed573',
  },
  scannedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 20,
    color: '#2c3e50',
  },
  scanAgainButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanAgainText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
  },
  closeText: {
    color: '#ff4757',
    fontSize: 16,
  },
});

export default QRScanner;