import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';
import QRCode from 'qrcode';
import { colors } from '../../constants/colors';

interface ScannableQRCodeProps {
  value: string;
  size?: number;
}

export const ScannableQRCode: React.FC<ScannableQRCodeProps> = ({ value, size = 180 }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(
      value,
      {
        width: size * 2, // 2x for sharp retina rendering
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      },
      (err, url) => {
        if (!isMounted) return;
        if (err) {
          setError('Failed to generate QR code');
        } else {
          setDataUrl(url);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (error) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!dataUrl) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: dataUrl }}
        style={{ width: size, height: size, borderRadius: 8 }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: 'center',
  },
});

