import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ZapStockLogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  variant?: 'icon' | 'text' | 'full';
}

const ZapStockLogo: React.FC<ZapStockLogoProps> = ({ 
  size = 'medium', 
  showTagline = true, 
  variant = 'full' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { icon: 24, text: 16, tagline: 12 };
      case 'medium': return { icon: 32, text: 20, tagline: 14 };
      case 'large': return { icon: 48, text: 28, tagline: 18 };
      default: return { icon: 32, text: 20, tagline: 14 };
    }
  };

  const sizes = getSize();

  if (variant === 'icon') {
    return (
      <View style={styles.iconContainer}>
        {/* Icon removed - empty container */}
      </View>
    );
  }

  if (variant === 'text') {
    return (
      <View style={styles.textContainer}>
        <Text style={[styles.brandName, { fontSize: sizes.text }]}>
          <Text style={styles.zapText}>Zap</Text>
          <Text style={styles.stockText}>Stock</Text>
        </Text>
        {showTagline && (
          <Text style={[styles.tagline, { fontSize: sizes.tagline }]}>
            Fast Stock. Sure Stock. ZapStock!
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.iconContainer}>
        {/* Icon removed - empty container */}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.brandName, { fontSize: sizes.text }]}>
          <Text style={styles.zapText}>Zap</Text>
          <Text style={styles.stockText}>Stock</Text>
        </Text>
        {showTagline && (
          <Text style={[styles.tagline, { fontSize: sizes.tagline }]}>
            Fast Stock. Sure Stock. ZapStock!
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  zapText: {
    color: '#3B82F6',
  },
  stockText: {
    color: '#1E40AF',
  },
  tagline: {
    color: '#F59E0B',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default ZapStockLogo;

