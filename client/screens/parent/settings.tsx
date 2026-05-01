/**
 * 家长端设置页面
 * 基于UI设计文档优化：清爽专业风格
 * 参考：PRD文档 - P0.3 家长端设置功能
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9092';

// 家长端配色系统
const PARENT_COLORS = {
  primary: '#4A90D9',
  secondary: '#F5A6B8',
  accent: '#8B7EC8',
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#F5222D',
  bgLight: '#F8F9FB',
  cardBg: '#FFFFFF',
  textPrimary: '#2C3E50',
  textSecondary: '#6B7C93',
  border: '#E8ECF0',
};

// 设置项接口
interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean | string;
  onPress?: () => void;
  badge?: string;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

export default function ParentSettingsScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // 睡眠提醒设置
  const [sleepReminderEnabled, setSleepReminderEnabled] = useState(true);
  const [sleepReminderTime, setSleepReminderTime] = useState('21:00');
  
  // 通知设置
  const [ritualReminder, setRitualReminder] = useState(true);
  const [sleepReport, setSleepReport] = useState(true);
  const [tips, setTips] = useState(true);
  
  // 播放设置
  const [defaultTimer, setDefaultTimer] = useState('30分钟');
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  // 退出登录处理
  const handleLogout = useCallback(() => {
    Alert.alert(
      '退出登录',
      '确定要退出当前账号吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', style: 'destructive', onPress: () => {
          // 实际应用中这里会清除登录状态并跳转
          console.log('User logged out');
        }},
      ]
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim])
  );

  // 设置分组数据
  const settingGroups: SettingGroup[] = [
    {
      title: '睡眠提醒',
      items: [
        {
          id: 'sleep_reminder',
          title: '睡前提醒',
          subtitle: '提醒时间 21:00',
          icon: 'bell',
          iconColor: PARENT_COLORS.primary,
          type: 'toggle',
          value: sleepReminderEnabled,
          onPress: () => setSleepReminderEnabled(!sleepReminderEnabled),
        },
        {
          id: 'reminder_time',
          title: '提醒时间',
          subtitle: sleepReminderTime,
          icon: 'clock',
          iconColor: PARENT_COLORS.warning,
          type: 'navigation',
          onPress: () => {
            Alert.alert('选择时间', '时间选择器将在这里显示', [
              { text: '21:00', onPress: () => setSleepReminderTime('21:00') },
              { text: '21:15', onPress: () => setSleepReminderTime('21:15') },
              { text: '21:30', onPress: () => setSleepReminderTime('21:30') },
            ]);
          },
        },
      ],
    },
    {
      title: '播放设置',
      items: [
        {
          id: 'default_timer',
          title: '默认定时关闭',
          subtitle: defaultTimer,
          icon: 'hourglass-half',
          iconColor: PARENT_COLORS.accent,
          type: 'navigation',
          onPress: () => {
            Alert.alert('选择定时时长', '音频播放自动关闭时长', [
              { text: '15分钟', onPress: () => setDefaultTimer('15分钟') },
              { text: '30分钟', onPress: () => setDefaultTimer('30分钟') },
              { text: '45分钟', onPress: () => setDefaultTimer('45分钟') },
              { text: '60分钟', onPress: () => setDefaultTimer('60分钟') },
            ]);
          },
        },
        {
          id: 'auto_play',
          title: '自动播放下一个',
          subtitle: '音频播完后自动播放下一个',
          icon: 'step-forward',
          iconColor: PARENT_COLORS.success,
          type: 'toggle',
          value: autoPlayNext,
          onPress: () => setAutoPlayNext(!autoPlayNext),
        },
      ],
    },
    {
      title: '通知设置',
      items: [
        {
          id: 'ritual_reminder',
          title: '仪式提醒',
          subtitle: '每日睡前仪式开始提醒',
          icon: 'moon',
          iconColor: PARENT_COLORS.primary,
          type: 'toggle',
          value: ritualReminder,
          onPress: () => setRitualReminder(!ritualReminder),
        },
        {
          id: 'sleep_report_notify',
          title: '睡眠报告',
          subtitle: '接收睡眠报告推送',
          icon: 'chart-bar',
          iconColor: PARENT_COLORS.success,
          type: 'toggle',
          value: sleepReport,
          onPress: () => setSleepReport(!sleepReport),
        },
        {
          id: 'tips',
          title: '温馨小贴士',
          subtitle: '接收睡眠知识推送',
          icon: 'lightbulb',
          iconColor: PARENT_COLORS.warning,
          type: 'toggle',
          value: tips,
          onPress: () => setTips(!tips),
        },
      ],
    },
    {
      title: '账号与安全',
      items: [
        {
          id: 'account',
          title: '账号安全',
          subtitle: '微信已绑定',
          icon: 'shield-alt',
          iconColor: PARENT_COLORS.success,
          type: 'navigation',
          onPress: () => Alert.alert('账号安全', '微信账号已绑定，安全可靠'),
        },
        {
          id: 'privacy',
          title: '隐私设置',
          icon: 'lock',
          iconColor: PARENT_COLORS.accent,
          type: 'navigation',
          onPress: () => Alert.alert('隐私设置', '儿童数据保护设置'),
        },
        {
          id: 'logout',
          title: '退出登录',
          icon: 'sign-out-alt',
          iconColor: PARENT_COLORS.error,
          type: 'action',
          onPress: () => {
            Alert.alert(
              '退出登录',
              '确定要退出当前账号吗？',
              [
                { text: '取消', style: 'cancel' },
                { text: '确定', style: 'destructive', onPress: handleLogout },
              ]
            );
          },
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          id: 'about',
          title: '关于我们',
          icon: 'circle-info',
          iconColor: PARENT_COLORS.textSecondary,
          type: 'navigation',
          onPress: () => Alert.alert('关于', '儿童睡眠综合解决方案\n版本 1.0.0'),
        },
        {
          id: 'help',
          title: '帮助与反馈',
          icon: 'question-circle',
          iconColor: PARENT_COLORS.primary,
          type: 'navigation',
          onPress: () => Alert.alert('帮助与反馈', '如有问题，请联系客服'),
        },
        {
          id: 'delete_account',
          title: '删除账号',
          subtitle: '删除后数据无法恢复',
          icon: 'trash-alt',
          iconColor: PARENT_COLORS.error,
          type: 'action',
          onPress: () => {
            Alert.alert(
              '删除账号',
              '删除账号将清除所有数据，此操作不可恢复。确定要删除吗？',
              [
                { text: '取消', style: 'cancel' },
                { 
                  text: '删除', 
                  style: 'destructive', 
                  onPress: () => Alert.alert('提示', '请联系客服完成账号删除') 
                },
              ]
            );
          },
        },
      ],
    },
  ];

  // 渲染设置项
  const renderSettingItem = (item: SettingItem) => {
    const isToggle = item.type === 'toggle';
    const isAction = item.type === 'action';
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          isAction && styles.settingItemAction,
        ]}
        onPress={item.onPress}
        disabled={isToggle}
        activeOpacity={0.7}
      >
        {/* 图标 */}
        <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
          <FontAwesome6 name={item.icon as any} size={18} color={item.iconColor} />
        </View>
        
        {/* 文字 */}
        <View className="flex-1 ml-3">
          <Text className="text-sm font-medium" style={{ color: isAction ? PARENT_COLORS.error : PARENT_COLORS.textPrimary }}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text className="text-xs mt-0.5" style={{ color: PARENT_COLORS.textSecondary }}>
              {item.subtitle}
            </Text>
          )}
        </View>
        
        {/* 右侧操作 */}
        {isToggle ? (
          <Switch
            value={item.value as boolean}
            onValueChange={item.onPress}
            trackColor={{ false: PARENT_COLORS.border, true: `${PARENT_COLORS.primary}60` }}
            thumbColor={item.value ? PARENT_COLORS.primary : '#f4f3f4'}
          />
        ) : item.type === 'navigation' ? (
          <FontAwesome6 name="chevron-right" size={14} color={PARENT_COLORS.textSecondary} />
        ) : (
          <View />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Screen className="flex-1" style={{ backgroundColor: PARENT_COLORS.bgLight }}>
      <SafeAreaView className="flex-1">
        <Animated.ScrollView 
          style={[styles.container, { opacity: fadeAnim }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 头部 */}
          <View style={styles.header}>
            <Text className="text-xl font-bold" style={{ color: PARENT_COLORS.textPrimary }}>
              设置
            </Text>
          </View>

          {/* 设置分组 */}
          {settingGroups.map((group, groupIndex) => (
            <View key={group.title} style={styles.group}>
              <Text className="text-xs font-medium px-4 mb-2" style={{ color: PARENT_COLORS.textSecondary }}>
                {group.title}
              </Text>
              <View style={styles.groupCard}>
                {group.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {renderSettingItem(item)}
                    {index < group.items.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}

          {/* 版本信息 */}
          <View className="items-center py-6">
            <Text className="text-xs" style={{ color: PARENT_COLORS.textSecondary }}>
              儿童睡眠综合解决方案 v1.0.0
            </Text>
          </View>

          {/* 底部留白 */}
          <View className="h-10" />
        </Animated.ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  group: {
    marginBottom: 8,
  },
  groupCard: {
    backgroundColor: PARENT_COLORS.cardBg,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemAction: {
    backgroundColor: PARENT_COLORS.cardBg,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 60,
    backgroundColor: PARENT_COLORS.border,
  },
});
