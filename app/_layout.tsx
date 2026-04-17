import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import 'react-native-reanimated';

import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import {
  fetchCities,
  fetchRelationships,
  fetchReviews,
  fetchUsers,
} from '@/store/travoSlice';

function AppNavigator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchCities());
    void dispatch(fetchUsers());
    void dispatch(fetchReviews());
    void dispatch(fetchRelationships());
  }, [dispatch]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
