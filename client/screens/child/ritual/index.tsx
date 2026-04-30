/**
 * 睡前仪式选择页面
 * 基于UI设计文档和原型优化
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

// 儿童端配色
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
  emoji: string;
  iconName: string;
  steps: string[];
  duration: number;
  description: string;
  ageRange: string[];
  suitable: string;
  popular?: boolean;
}

interface AgeGroup {
  id: string;
  label: string;
}

// 仪式模板数据
const RITUALS: Ritual[] = [
  {
    id: 1,
    name: '月亮晚安式',
    emoji: '',
    iconName: 'moon',
    steps: ['洗漱', '换衣', '喝水', '故事', '睡觉'],
    duration: 15,
    description: '温馨的睡前仪式，帮助孩子放松身心',
    ageRange: ['1-3y', '3-6y'],
    suitable: '适合大多数孩子',
    popular: true,
  },
  {
    id: 2,
    name: '海洋摇篮式',
    emoji: '',
    iconName: 'water',
    steps: ['洗澡', '按摩', '摇篮曲', '睡觉'],
    duration: 20,
    description: '适合洗澡日的放松仪式',
    ageRange: ['0-6m', '6-12m', '1-3y'],
    suitable: '适合洗澡日',
  },
  {
    id: 3,
    name: '森林探险式',
    emoji: '',
    iconName: 'leaf',
    steps: ['森林散步', '躲进小屋', '听故事', '睡觉'],
    duration: 15,
    description: '适合活泼好动的孩子',
    ageRange: ['3-6y', '6-12y'],
    suitable: '适合活泼的孩子',
  },
  {
    id: 4,
    name: '星星魔法式',
    emoji: '',
    iconName: 'sparkles',
    steps: ['魔法变装', '魔法故事', '数星星', '睡觉'],
    duration: 10,
    description: '快速哄睡的魔法仪式',
    ageRange: ['1-3y', '3-6y'],
    suitable: '快速哄睡',
  },
  {
    id: 5,
    name: '洗澡放松式',
    emoji: '',
    iconName: 'water-outline',
    steps: ['洗澡', '擦香香', '喝牛奶', '睡觉'],
    duration: 25,
    description: '适合洗澡日的舒缓仪式',
    ageRange: ['6-12m', '1-3y', '3-6y'],
    suitable: '适合洗澡日',
  },
];

// 年龄组配置
const AGE_GROUPS: AgeGroup[] = [
  { id: '0-6m', label: '0-6月' },
  { id: '6-12m', label: '6-12月' },
  { id: '1-3y', label: '1-3岁' },
  { id: '3-6y', label: '3-6岁' },
  { id: '6-12y', label: '6-12岁' },
];

// 获取图标名称
const getIconName = (name: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    'moon': 'moon',
    'water': 'water',
    'leaf': 'leaf',
    'sparkles': 'sparkles',
    'water-outline': 'water-outline',
  };
  return iconMap[name] || 'moon';
};

// 随机星星位置
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * Dimensions.get('window').width,
  top: Math.random() * 200,
  size: Math.random() * 2 + 1,
  opacity: Math.random() * 0.5 + 0.3,
}));

export default function RitualScreen() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState('3-6y');
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);

  // 根据年龄筛选仪式
  const filteredRituals = RITUALS.filter((ritual) =>
    ritual.ageRange.includes(selectedAge)
  );

  const handleSelectRitual = (ritual: Ritual) => {
    setSelectedRitual(ritual);
  };

  const handleStartRitual = () => {
    if (selectedRitual) {
      // 导航到仪式播放页面，传递完整仪式数据
      router.push({
        pathname: '/ritual-player',
        params: { ritual: JSON.stringify(selectedRitual) },
      });
    }
  };

  return (
    <Screen style={styles.container}>
      {/* 背景星星 */}
      {STARS.map((star) => (
        <View
          key={star.id}
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>睡前仪式</Text>
          <Text style={styles.headerSubtitle}>选择今晚的睡前仪式</Text>
        </View>

        {/* 年龄段选择 */}
        <View style={styles.ageSection}>
          <Text style={styles.sectionLabel}>选择年龄段</Text>
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ageScrollContent}
            >
              {AGE_GROUPS.map((age) => (
              <TouchableOpacity
                key={age.id}
                style={[
                  styles.ageChip,
                  selectedAge === age.id && styles.ageChipActive,
                ]}
                onPress={() => setSelectedAge(age.id)}
              >
                <Text
                  style={[
                    styles.ageChipText,
                    selectedAge === age.id && styles.ageChipTextActive,
                  ]}
                >
                  {age.label}
                </Text>
              </TouchableOpacity>
            ))}
            </ScrollView>
          </View>
        </View>

        {/* 仪式列表 */}
        <View style={styles.ritualSection}>
          <Text style={styles.sectionLabel}>选择仪式</Text>
          {filteredRituals.map((ritual) => (
            <TouchableOpacity
              key={ritual.id}
              style={[
                styles.ritualCard,
                selectedRitual?.id === ritual.id && styles.ritualCardSelected,
              ]}
              onPress={() => handleSelectRitual(ritual)}
              activeOpacity={0.8}
            >
              {/* 左侧图标 */}
              <View style={styles.ritualIcon}>
                <View style={styles.iconCircle}>
                  <Text style={styles.ritualEmoji}>{ritual.emoji}</Text>
                </View>
                {ritual.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>热门</Text>
                  </View>
                )}
              </View>

              {/* 中间内容 */}
              <View style={styles.ritualContent}>
                <View style={styles.ritualHeader}>
                  <Text style={styles.ritualName}>{ritual.name}</Text>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time-outline" size={12} color="#888" />
                    <Text style={styles.durationText}>{ritual.duration}分钟</Text>
                  </View>
                </View>
                <Text style={styles.ritualSteps}>
                  {ritual.steps.join(' → ')}
                </Text>
                <View style={styles.ritualFooter}>
                  <Text style={styles.ritualSuitable}>{ritual.suitable}</Text>
                  <Text style={styles.ritualAge}>{ritual.ageRange.join('/')}</Text>
                </View>
              </View>

              {/* 选中状态 */}
              {selectedRitual?.id === ritual.id && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {filteredRituals.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="moon-outline" size={48} color={CHILD_COLORS.textMuted} />
              <Text style={styles.emptyText}>
                该年龄段暂无推荐仪式
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部开始按钮 */}
      {selectedRitual && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartRitual}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={24} color="#FFF" />
            <Text style={styles.startButtonText}>
              开始{selectedRitual.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CHILD_COLORS.bgStart,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: CHILD_COLORS.textMuted,
  },
  ageSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  ageScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  ageChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginRight: 8,
  },
  ageChipActive: {
    backgroundColor: CHILD_COLORS.golden,
  },
  ageChipText: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
  },
  ageChipTextActive: {
    color: CHILD_COLORS.bgStart,
    fontWeight: '600',
  },
  ritualSection: {
    paddingHorizontal: 20,
  },
  ritualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CHILD_COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ritualCardSelected: {
    borderColor: CHILD_COLORS.primary,
  },
  ritualEmoji: {
    fontSize: 48,
    marginRight: 14,
  },
  ritualIcon: {
    marginRight: 14,
    position: 'relative',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#F55',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  ritualContent: {
    flex: 1,
  },
  ritualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ritualName: {
    fontSize: 17,
    fontWeight: '600',
    color: CHILD_COLORS.cardText,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: 12,
    color: '#888',
  },
  ritualSteps: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  ritualFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ritualSuitable: {
    fontSize: 12,
    color: CHILD_COLORS.primary,
  },
  ritualAge: {
    fontSize: 11,
    color: '#999',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CHILD_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
    marginTop: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: CHILD_COLORS.bgStart,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHILD_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});
