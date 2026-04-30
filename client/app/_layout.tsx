import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { Provider } from '@/components/Provider';

export default function RootLayout() {
  return (
    <Provider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1a1b26' },
        }}
      >
        {/* 儿童端页面 - 带底部Tab导航 */}
        <Stack.Screen name="(tabs)" />
        
        {/* 睡前仪式选择页 */}
        <Stack.Screen 
          name="ritual" 
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
        
        {/* 睡前仪式播放页 */}
        <Stack.Screen 
          name="ritual-player" 
          options={{ 
            animation: 'slide_from_bottom',
          }} 
        />
        
        {/* 家长端首页 */}
        <Stack.Screen 
          name="parent" 
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
        
        {/* 睡眠报告页 */}
        <Stack.Screen 
          name="reports" 
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
        
        {/* 育儿指导页 */}
        <Stack.Screen 
          name="guides" 
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
        
        {/* 家长设置页 */}
        <Stack.Screen 
          name="settings" 
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
        
        {/* 会员中心页 */}
        <Stack.Screen 
          name="subscription" 
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
    </Provider>
  );
}
