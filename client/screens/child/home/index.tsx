/**
 * 儿童端首页 - 睡前仪式引导入口
 * 基于UI设计文档和原型优化
 * 参考：儿童端首页设计 - 深蓝星空+暖黄星光
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 儿童端配色 - 深蓝星空+暖黄星光
const CHILD_COLORS = {
  bgStart: '#1a1a3e',
  bgEnd: '#2d2d5a',
  golden: '#FFD93D',
  primary: '#4A90D9',
  warmWhite: '#F8F1D1',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  cardText: '#2C3E50',
};

interface Ritual {
  id: number;
  name: string;
  description: string;
  icon: string;
  duration: number;
  order: number;
  tips: string[];
}

interface Star {
  left: number;
  top: number;
  size: number;
  opacity: number;
}

const STARS: Star[] = [
  { left: SCREEN_WIDTH * 0.1, top: 50, size: 2, opacity: 0.8 },
  { left: SCREEN_WIDTH * 0.25, top: 30, size: 1.5, opacity: 0.6 },
  { left: SCREEN_WIDTH * 0.4, top: 70, size: 2, opacity: 0.7 },
  { left: SCREEN_WIDTH * 0.6, top: 40, size: 1.5, opacity: 0.5 },
  { left: SCREEN_WIDTH * 0.75, top: 80, size: 2, opacity: 0.6 },
  { left: SCREEN_WIDTH * 0.9, top: 55, size: 1.5, opacity: 0.7 },
];

const DEFAULT_RITUALS: Ritual[] = [
  { id: 1, name: '月亮晚安式', description: '温馨的睡前仪式，帮助孩子安心入睡', icon: 'moon', duration: 15, order: 1, tips: ['先洗漱', '换睡衣', '喝温水', '听故事', '关灯睡觉'] },
  { id: 2, name: '海洋摇篮式', description: '适合洗澡日的放松仪式', icon: 'water', duration: 20, order: 2, tips: ['温暖洗澡', '轻柔按摩', '摇篮曲', '安心入睡'] },
  { id: 3, name: '森林探险式', description: '适合活泼好动的孩子', icon: 'leaf', duration: 15, order: 3, tips: ['森林散步', '躲进小屋', '听故事', '进入梦乡'] },
];

export default function ChildHomeScreen() {
  const [rituals, setRituals] = useState<Ritual[]>(DEFAULT_RITUALS);
  const [fadeAnim] = useState(new Animated.Value(0));

  // 图标映射函数
  const mapIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'moon': 'moon',
      'water': 'water',
      'leaf': 'leaf',
      'star': 'star',
      'bed': 'bed',
    };
    return iconMap[icon] || 'moon';
  };

  // 定义fetchData函数
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/ritual-templates`);
      const result = await response.json();
      if (result.success && result.data?.templates) {
        const formattedRituals = result.data.templates.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          icon: mapIconName(r.icon),
          duration: r.duration || 15,
          order: r.sortOrder || 1,
          tips: r.steps?.map((s: any) => s.name) || [],
        }));
        setRituals(formattedRituals.length > 0 ? formattedRituals : DEFAULT_RITUALS);
      }
    } catch (error) {
      console.error('Failed to fetch rituals:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [fetchData, fadeAnim])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const handleStartRitual = (ritualId: number) => {
    router.push({ pathname: '/ritual', params: { id: ritualId.toString() } });
  };

  const handleGoToStories = () => {
    router.push('/stories');
  };

  const handleGoToSounds = () => {
    router.push('/sounds');
  };

  const handleGoToParent = () => {
    router.push('/parent');
  };

  return (
    <Screen style={styles.container}>
      {/* 背景星星 */}
      {STARS.map((star, index) => (
        <View
          key={index}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* 问候语区域 */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()}，小朋友！</Text>
          <Text style={styles.subtitle}>今晚也要好好睡觉哦</Text>
        </View>

        {/* 今晚仪式推荐卡片 */}
        <View style={styles.ritualCard}>
          <View style={styles.ritualCardHeader}>
            <View style={styles.ritualHeaderLeft}>
              <Ionicons name="moon" size={20} color={CHILD_COLORS.golden} />
              <Text style={styles.ritualCardTitle}>今晚的睡前仪式</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/ritual')}>
              <Text style={styles.ritualMore}>更多</Text>
            </TouchableOpacity>
          </View>

          {rituals.length > 0 && (
            <View style={styles.ritualMain}>
              <View style={styles.ritualIconContainer}>
                <Ionicons name={mapIconName(rituals[0].icon) as any} size={32} color={CHILD_COLORS.primary} />
              </View>
              <View style={styles.ritualInfo}>
                <Text style={styles.ritualName}>{rituals[0].name}</Text>
                <Text style={styles.ritualDuration}>约{rituals[0].duration}分钟</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartRitual(rituals[0]?.id || 1)}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>开始哄睡</Text>
          </TouchableOpacity>
        </View>

        {/* 快捷功能入口 */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleGoToStories}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="book" size={24} color={CHILD_COLORS.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>故事盒</Text>
              <Text style={styles.quickActionDesc}>听故事入睡</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleGoToSounds}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="cloud" size={24} color={CHILD_COLORS.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>白噪音</Text>
              <Text style={styles.quickActionDesc}>自然的声音</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 家长模式入口 */}
        <TouchableOpacity
          style={styles.parentModeButton}
          onPress={handleGoToParent}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={18} color={CHILD_COLORS.textMuted} />
          <Text style={styles.parentModeText}>切换家长模式</Text>
        </TouchableOpacity>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CHILD_COLORS.bgStart,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  star: {
    position: 'absolute',
    backgroundColor: CHILD_COLORS.golden,
    borderRadius: 10,
  },
  greetingSection: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
    marginTop: 4,
  },
  ritualCard: {
    backgroundColor: CHILD_COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  ritualCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ritualHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ritualCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CHILD_COLORS.cardText,
  },
  ritualMore: {
    fontSize: 13,
    color: CHILD_COLORS.primary,
  },
  ritualMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  ritualIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ritualInfo: {
    flex: 1,
  },
  ritualName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CHILD_COLORS.cardText,
    marginBottom: 2,
  },
  ritualDuration: {
    fontSize: 13,
    color: '#666',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHILD_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickActions: {
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CHILD_COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CHILD_COLORS.cardText,
    marginBottom: 2,
  },
  quickActionDesc: {
    fontSize: 13,
    color: '#888',
  },
  parentModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  parentModeText: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
  },
});
