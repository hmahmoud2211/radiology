import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}
