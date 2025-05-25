import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, []);

  // Show a loading spinner while waiting
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
} 