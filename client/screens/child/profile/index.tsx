/**
 * 我的页面 - 儿童端
 * 基于UI设计文档优化
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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

// 统计数据
const STATS = [
  { label: '今晚睡眠', value: '8h30m', icon: 'moon' as const },
  { label: '入睡时间', value: '21:30', icon: 'time' as const },
  { label: '连续坚持', value: '7天', icon: 'flame' as const },
];

// 菜单项
const MENU_ITEMS = [
  { icon: 'heart', name: '我的收藏', color: '#FF6B6B', badge: 5 },
  { icon: 'time', name: '播放历史', color: '#4ECDC4', badge: 0 },
  { icon: 'star', name: '睡眠成就', color: '#FFD93D', badge: 0 },
  { icon: 'settings', name: '设置', color: '#95A5A6', badge: 0 },
];

// 随机星星位置
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * Dimensions.get('window').width,
  top: Math.random() * 300,
  size: Math.random() * 2 + 1,
  opacity: Math.random() * 0.5 + 0.3,
}));

export default function ProfileScreen() {
  const handleMenuPress = (name: string) => {
    if (name === '设置') {
      router.push('/settings');
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
        {/* 头像区域 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="happy" size={50} color="#FFF" />
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="moon" size={14} color="#FFF" />
            </View>
          </View>
          <Text style={styles.userName}>小明</Text>
          <Text style={styles.userGreeting}>今晚睡个好觉</Text>
        </View>

        {/* 今晚睡眠统计 */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>今晚睡眠</Text>
          <View style={styles.statsGrid}>
            {STATS.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name={stat.icon} size={20} color={CHILD_COLORS.primary} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 成就卡片 */}
        <View style={styles.achievementSection}>
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Ionicons name="trophy" size={24} color={CHILD_COLORS.golden} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>连续7天完成睡前仪式</Text>
              <Text style={styles.achievementDesc}>继续保持，小勇士！</Text>
            </View>
            <View style={styles.achievementBadge}>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </View>
          </View>
        </View>

        {/* 菜单列表 */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>我的</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleMenuPress(item.name)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuName}>{item.name}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 切换家长模式 */}
        <TouchableOpacity
          style={styles.parentModeButton}
          onPress={() => router.push('/parent')}
          activeOpacity={0.8}
        >
          <View style={styles.parentModeContent}>
            <View style={styles.parentModeIcon}>
              <Ionicons name="person" size={20} color={CHILD_COLORS.primary} />
            </View>
            <View style={styles.parentModeInfo}>
              <Text style={styles.parentModeTitle}>切换家长模式</Text>
              <Text style={styles.parentModeDesc}>查看睡眠报告和设置</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={CHILD_COLORS.primary} />
        </TouchableOpacity>
      </ScrollView>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: CHILD_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: CHILD_COLORS.golden,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CHILD_COLORS.golden,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userGreeting: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: CHILD_COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CHILD_COLORS.cardText,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
  },
  achievementSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementCard: {
    backgroundColor: CHILD_COLORS.golden,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  achievementBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: CHILD_COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuName: {
    fontSize: 15,
    color: CHILD_COLORS.cardText,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  parentModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CHILD_COLORS.cardBg,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
  },
  parentModeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parentModeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  parentModeInfo: {
    flex: 1,
  },
  parentModeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: CHILD_COLORS.cardText,
    marginBottom: 2,
  },
  parentModeDesc: {
    fontSize: 12,
    color: '#888',
  },
});
