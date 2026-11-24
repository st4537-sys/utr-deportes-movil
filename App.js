import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import InventarioScreen from './src/screens/InventarioScreen';
import MisPrestamosScreen from './src/screens/MisPrestamosScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function StudentTabs() {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#2563eb',
        headerRight: () => (
          <TouchableOpacity
            onPress={logout}
            style={{ marginRight: 14, backgroundColor: '#475569', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Salir</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen name="Inventario" component={InventarioScreen} options={{ title: 'Inventario' }} />
      <Tab.Screen name="MisPrestamos" component={MisPrestamosScreen} options={{ title: 'Mis Préstamos' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loadingSession } = useAuth();

  if (loadingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <StudentTabs />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}