// utils/Toast.js - Simple toast notification utility
import { Alert, ToastAndroid, Platform } from 'react-native';

class Toast {
  static show(message, type = 'info', duration = 'SHORT') {
    if (Platform.OS === 'android') {
      // Use ToastAndroid for Android
      const toastDuration = duration === 'LONG' ? ToastAndroid.LONG : ToastAndroid.SHORT;
      ToastAndroid.show(message, toastDuration);
    } else {
      // Use Alert for iOS as fallback
      Alert.alert('', message);
    }
  }

  static success(message, duration = 'SHORT') {
    this.show(`✅ ${message}`, 'success', duration);
  }

  static error(message, duration = 'LONG') {
    this.show(`❌ ${message}`, 'error', duration);
  }

  static warning(message, duration = 'SHORT') {
    this.show(`⚠️ ${message}`, 'warning', duration);
  }

  static info(message, duration = 'SHORT') {
    this.show(`ℹ️ ${message}`, 'info', duration);
  }

  static loading(message, duration = 'SHORT') {
    this.show(`⏳ ${message}`, 'loading', duration);
  }
}

export default Toast;