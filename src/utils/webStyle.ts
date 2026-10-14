import { Platform, ViewStyle } from 'react-native';

// Keeps content from stretching edge-to-edge on wide browser windows,
// while leaving native (phone-sized) screens untouched.
export const webMaxWidth: ViewStyle = Platform.OS === 'web'
  ? { width: '100%', maxWidth: 480, alignSelf: 'center' }
  : {};
