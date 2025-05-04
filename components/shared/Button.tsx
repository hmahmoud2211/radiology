import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Colors from '@/constants/colors';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.mediumGray;
    
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.secondary;
      case 'outline':
        return 'transparent';
      case 'danger':
        return Colors.error;
      default:
        return Colors.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return Colors.mediumGray;
    
    switch (variant) {
      case 'outline':
        return Colors.primary;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.darkGray;
    
    switch (variant) {
      case 'outline':
        return Colors.primary;
      case 'primary':
      case 'secondary':
      case 'danger':
        return 'white';
      default:
        return 'white';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'medium':
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 20 };
      default:
        return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          ...getPadding(),
          width: fullWidth ? '100%' : 'auto',
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.title,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;