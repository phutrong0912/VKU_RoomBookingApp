import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../../constants/colors';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
  onScanSuccess,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setIsCameraReady(false);
    }
  }, [visible]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned || !data) return;
    setScanned(true);
    onScanSuccess(data);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    setScanned(true);
    onScanSuccess(manualCode.trim());
  };

  const handleSimulateScan = (mockCode: string) => {
    if (scanned) return;
    setScanned(true);
    onScanSuccess(mockCode);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Room Door QR</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Camera or Permission Box */}
        <View style={styles.cameraContainer}>
          {Platform.OS === 'web' || !permission?.granted ? (
            <View style={styles.permissionFallback}>
              <Ionicons name="camera-outline" size={60} color="#94A3B8" />
              <Text style={styles.fallbackTitle}>
                {Platform.OS === 'web'
                  ? 'Camera Scanner (Web Preview)'
                  : !permission
                    ? 'Initializing Camera...'
                    : 'Camera Permission Needed'}
              </Text>
              <Text style={styles.fallbackSubtitle}>
                {Platform.OS === 'web'
                  ? 'In the browser, use instant door simulation or enter a room code.'
                  : !permission?.granted
                    ? 'Please allow VKU Room Booking to access your iPhone camera to scan door QR codes.'
                    : 'Camera is preparing...'}
              </Text>

              {Platform.OS !== 'web' && !permission?.granted && (
                <TouchableOpacity
                  style={styles.permissionBtn}
                  onPress={requestPermission}
                  activeOpacity={0.8}
                >
                  <Text style={styles.permissionBtnText}>Enable Camera Access</Text>
                </TouchableOpacity>
              )}

              {/* Manual Input Fallback */}
              <View style={styles.manualInputCard}>
                <Text style={styles.simLabel}>Or Enter Room Code Manually:</Text>
                <View style={styles.manualRow}>
                  <TextInput
                    style={styles.manualTextInput}
                    placeholder="e.g. A3-101, LIB-ZB, IT-402"
                    placeholderTextColor="#64748B"
                    value={manualCode}
                    onChangeText={setManualCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.manualSubmitBtn}
                    onPress={handleManualSubmit}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.manualSubmitText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick simulation buttons for fast testing */}
              <View style={styles.simulationWrap}>
                <Text style={styles.simLabel}>Quick Door Simulation:</Text>
                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => handleSimulateScan('VKU-ROOM-A3-101')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
                  <Text style={styles.simBtnText}>Scan Lab A3-101 Door</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => handleSimulateScan('VKU-ROOM-LIB-ZB')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
                  <Text style={styles.simBtnText}>Scan Library Zone B Door</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.cameraWrapper}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onCameraReady={() => setIsCameraReady(true)}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              >
                {/* Viewfinder Target Reticle */}
                <View style={styles.overlay}>
                  {!isCameraReady && (
                    <View style={styles.cameraLoading}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.cameraLoadingText}>Starting Camera Feed...</Text>
                    </View>
                  )}

                  <View style={styles.targetFrame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                  </View>
                  <Text style={styles.guideText}>
                    Point at the QR code on the room door
                  </Text>

                  {scanned && (
                    <TouchableOpacity
                      style={styles.rescanBtn}
                      onPress={() => setScanned(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.rescanText}>Tap to Scan Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </CameraView>

              {/* Bottom Quick Test Option while Camera is active */}
              <View style={styles.cameraBottomBar}>
                <TouchableOpacity
                  style={styles.quickSimChip}
                  onPress={() => handleSimulateScan('VKU-ROOM-A3-101')}
                >
                  <Text style={styles.quickSimText}>⚡ Quick Test: Lab A3-101</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cameraLoading: {
    position: 'absolute',
    top: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraLoadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  targetFrame: {
    width: 240,
    height: 240,
    position: 'relative',
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#38BDF8',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 24,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  rescanBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescanText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  permissionFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0F172A',
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  manualInputCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  manualTextInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#475569',
  },
  manualSubmitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  simulationWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  simLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  simBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cameraBottomBar: {
    padding: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  quickSimChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickSimText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
});
