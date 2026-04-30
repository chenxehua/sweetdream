import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1b26',
          borderTopWidth: 1,
          borderTopColor: '#2d2e3f',
          height: Platform.OS === 'web' ? 'auto' : 60,
          paddingBottom: Platform.OS === 'ios' ? 8 : 4,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#f5c842',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: '故事',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="book-open" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sounds"
        options={{
          title: '声音',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="music" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
