import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function CatchAllRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(tabs)/dashboard');
  }, []);
  return null;
} 