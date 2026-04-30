/**
 * 家长端首页 - 仪表盘
 * 基于UI设计文档优化：
 * - 清爽专业风格
 * - 睡眠监测功能
 * - 倒退期提醒功能
 * 参考：PRD文档 - 家长端信息架构 + 小红书用户调研报告
 */
import React, { useState, useCallback, useEffect, useId } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 生成唯一ID的辅助函数（用于离线模式）
const generateId = (() => {
  let counter = 0;
  return () => `local-${Date.now()}-${counter++}`;
})();

// 家长端配色系统 - 参考UI设计文档
const PARENT_COLORS = {
  primary: '#4A90D9',        // 月光蓝
  secondary: '#F5A6B8',      // 晚霞粉
  accent: '#8B7EC8',         // 星空紫
  success: '#52C41A',        // 成功绿
  warning: '#FAAD14',        // 警告色
  danger: '#F5222D',         // 危险色
  bgLight: '#F8F9FB',       // 云朵白
  cardBg: '#FFFFFF',
  textPrimary: '#2C3E50',    // 深夜蓝
  textSecondary: '#6B7C93',  // 星光灰
  border: '#E8ECF0',
  golden: '#FFD93D',
};

// 睡眠倒退期配置 - 参考小红书用户调研
const SLEEP_REGRESSION_PERIODS = [
  { age: '4月龄', weeks: 16, description: '睡眠周期变化，可能出现频繁夜醒', symptoms: ['小睡缩短', '夜醒增加', '入睡困难'] },
  { age: '8-10月龄', weeks: 36, description: '大运动发展期，翻身、爬行影响睡眠', symptoms: ['翻身醒来', '爬行兴奋', '分离焦虑'] },
  { age: '12月龄', weeks: 52, description: '学站学走期，站立欲望影响入睡', symptoms: ['站立玩耍', '夜醒扶站', '早醒'] },
  { age: '18月龄', weeks: 78, description: '语言发展期，情绪波动大', symptoms: ['情绪不稳定', '夜醒哭闹', '拒绝小睡'] },
];

// 倒退期检测函数
const checkSleepRegression = (childAgeMonths: number): { isRegression: boolean; period?: typeof SLEEP_REGRESSION_PERIODS[0]; daysRemaining?: number } => {
  const currentWeek = childAgeMonths * 4;
  
  for (const period of SLEEP_REGRESSION_PERIODS) {
    const diff = Math.abs(currentWeek - period.weeks);
    if (diff <= 2) { // 前后2周内算作倒退期
      return { isRegression: true, period, daysRemaining: (2 - diff) * 7 };
    }
  }
  
  return { isRegression: false };
};

interface Child {
  id: number;
  name: string;
  gender: string;
  age: number;
  avatar: string;
  birthday: string;
}

interface SleepRecord {
  id: number;
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number; // 1-5
  duration: number; // 分钟
  nightAwakenings: number;
  note: string;
}

interface TodayStats {
  avgSleepTime: string;
  avgWakeTime: string;
  sleepEfficiency: number;
  improvement: string;
  totalRecords: number;
  avgDuration: number;
}

export default function ParentDashboardScreen() {
  const [child, setChild] = useState<Child | null>(null);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [regressionAlert, setRegressionAlert] = useState<{ isRegression: boolean; period?: typeof SLEEP_REGRESSION_PERIODS[0]; message?: string } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // 保存睡眠记录
  const saveSleepRecord = async (record: Omit<SleepRecord, 'id'>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/sleep-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: child?.id,
          bedtime: record.bedtime,
          wakeTime: record.wakeTime,
          quality: record.quality,
          rituals: record.note ? [record.note] : [],
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchSleepRecords();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save sleep record:', error);
      // 离线模式下保存到本地
      const localRecords = await AsyncStorage.getItem('sleep_records');
      const records = localRecords ? JSON.parse(localRecords) : [];
      records.unshift({ ...record, id: generateId() });
      await AsyncStorage.setItem('sleep_records', JSON.stringify(records));
      setSleepRecords(records);
      return true;
    }
  };

  // 获取睡眠记录
  const fetchSleepRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/sleep-records?limit=30`);
      const result = await response.json();
      if (result.success && result.data?.records) {
        const records = result.data.records.map((r: any) => ({
          id: r.id,
          date: r.date,
          bedtime: r.bedtime,
          wakeTime: r.wakeTime,
          quality: r.quality,
          duration: r.duration,
          nightAwakenings: 0,
          note: r.rituals?.join('、') || '',
        }));
        setSleepRecords(records);
        calculateStats(records);
        await AsyncStorage.setItem('sleep_records', JSON.stringify(records));
      }
    } catch (error) {
      console.error('Failed to fetch sleep records:', error);
      // 离线模式下从本地读取
      const localRecords = await AsyncStorage.getItem('sleep_records');
      if (localRecords) {
        const records = JSON.parse(localRecords);
        setSleepRecords(records);
        calculateStats(records);
      }
    }
  };

  // 计算统计数据
  const calculateStats = (records: SleepRecord[]) => {
    if (records.length === 0) return;

    const recentRecords = records.slice(0, 7); // 最近7天
    const avgDuration = recentRecords.reduce((sum, r) => sum + r.duration, 0) / recentRecords.length;
    const avgQuality = recentRecords.reduce((sum, r) => sum + r.quality, 0) / recentRecords.length;

    setTodayStats({
      avgSleepTime: recentRecords[0]?.bedtime || '--:--',
      avgWakeTime: recentRecords[0]?.wakeTime || '--:--',
      sleepEfficiency: Math.round((avgDuration / 600) * 100), // 假设目标10小时
      improvement: avgDuration > 540 ? '提前' : avgDuration < 540 ? '推迟' : '正常',
      totalRecords: records.length,
      avgDuration: Math.round(avgDuration),
    });

    // 生成建议
    if (avgDuration < 480) {
      setSuggestion('最近睡眠时长偏少，建议提前15-30分钟开始睡前仪式，帮助孩子更早入睡。');
    } else if (avgDuration > 600) {
      setSuggestion('睡眠时间充足，继续保持良好的作息习惯。');
    } else {
      setSuggestion('睡眠情况良好，建议坚持每晚相同的睡前仪式，有助于建立稳定的睡眠习惯。');
    }
  };

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      // 模拟获取孩子数据
      const mockChild = {
        id: 1,
        name: '小明',
        gender: 'male',
        age: 5, // 5岁
        avatar: '',
        birthday: '2020-01-15',
      };
      setChild(mockChild);

      // 检测倒退期
      const regression = checkSleepRegression(mockChild.age);
      if (regression.isRegression && regression.period) {
        setRegressionAlert({
          isRegression: true,
          period: regression.period,
          message: `注意：孩子可能正处于${regression.period.age}睡眠倒退期，表现为${regression.period.symptoms.join('、')}。这个阶段通常持续2-6周，建议保持耐心，继续坚持睡前仪式。`,
        });
      }

      // 模拟睡眠数据
      const mockRecords: SleepRecord[] = [
        { id: 1, date: '2024-01-15', bedtime: '21:30', wakeTime: '07:30', quality: 4, duration: 540, nightAwakenings: 0, note: '良好' },
        { id: 2, date: '2024-01-14', bedtime: '21:45', wakeTime: '07:35', quality: 3, duration: 530, nightAwakenings: 1, note: '有夜醒' },
        { id: 3, date: '2024-01-13', bedtime: '21:15', wakeTime: '07:20', quality: 5, duration: 545, nightAwakenings: 0, note: '很棒' },
        { id: 4, date: '2024-01-12', bedtime: '21:00', wakeTime: '07:15', quality: 4, duration: 555, nightAwakenings: 0, note: '早睡' },
        { id: 5, date: '2024-01-11', bedtime: '22:00', wakeTime: '07:40', quality: 3, duration: 520, nightAwakenings: 2, note: '入睡困难' },
        { id: 6, date: '2024-01-10', bedtime: '21:30', wakeTime: '07:30', quality: 4, duration: 540, nightAwakenings: 0, note: '正常' },
        { id: 7, date: '2024-01-09', bedtime: '21:20', wakeTime: '07:25', quality: 5, duration: 545, nightAwakenings: 0, note: '优质睡眠' },
      ];
      setSleepRecords(mockRecords);
      calculateStats(mockRecords);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  }, [checkSleepRegression, calculateStats]);

  // 记录今晚入睡
  const handleRecordSleep = () => {
    Alert.alert(
      '记录入睡',
      '是否记录今晚的入睡时间？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '记录入睡',
          onPress: async () => {
            const now = new Date();
            const bedtime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const success = await saveSleepRecord({
              date: now.toISOString().split('T')[0],
              bedtime,
              wakeTime: '--:--',
              quality: 0,
              duration: 0,
              nightAwakenings: 0,
              note: '入睡已记录',
            });
            if (success) {
              Alert.alert('成功', '已记录入睡时间，明早记得记录起床时间哦！');
            } else {
              Alert.alert('提示', '已暂存到本地，网络恢复后会自动同步');
            }
          },
        },
      ]
    );
  };

  // 记录明早起床
  const handleRecordWake = () => {
    const lastRecord = sleepRecords.find(r => r.wakeTime === '--:--' || r.wakeTime === '');
    if (!lastRecord) {
      Alert.alert('提示', '没有待完成的睡眠记录，请先记录入睡时间');
      return;
    }

    const now = new Date();
    const wakeTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // 计算睡眠时长
    const [bedHour, bedMin] = lastRecord.bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    let duration = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
    if (duration < 0) duration += 24 * 60; // 跨天情况

    Alert.alert(
      '记录起床',
      `入睡时间: ${lastRecord.bedtime}\n起床时间: ${wakeTime}\n睡眠时长: ${Math.floor(duration / 60)}小时${duration % 60}分钟\n\n请评估今晚睡眠质量：`,
      [
        { text: '取消', style: 'cancel' },
        { text: '1星', onPress: () => updateSleepRecord(lastRecord.id, wakeTime, duration, 1) },
        { text: '2星', onPress: () => updateSleepRecord(lastRecord.id, wakeTime, duration, 2) },
        { text: '3星', onPress: () => updateSleepRecord(lastRecord.id, wakeTime, duration, 3) },
        { text: '4星', onPress: () => updateSleepRecord(lastRecord.id, wakeTime, duration, 4) },
        { text: '5星', onPress: () => updateSleepRecord(lastRecord.id, wakeTime, duration, 5) },
      ]
    );
  };

  // 更新睡眠记录
  const updateSleepRecord = async (id: number | string, wakeTime: string, duration: number, quality: number) => {
    try {
      // 尝试更新服务端记录
      const response = await fetch(`${API_BASE}/api/v1/sleep-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wakeTime, quality }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchSleepRecords();
        Alert.alert('成功', '已记录睡眠数据！');
        return;
      }
    } catch (error) {
      console.error('Failed to update sleep record:', error);
    }

    // 本地更新（离线模式）
    const updatedRecords = sleepRecords.map(r =>
      r.id === id ? { ...r, wakeTime, duration, quality } : r
    );
    setSleepRecords(updatedRecords);
    calculateStats(updatedRecords);
    await AsyncStorage.setItem('sleep_records', JSON.stringify(updatedRecords));
    Alert.alert('成功', '已记录睡眠数据！（本地模式）');
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim, fetchData])
  );

  return (
    <Screen className="flex-1" style={{ backgroundColor: PARENT_COLORS.bgLight }}>
      <SafeAreaView className="flex-1">
        <Animated.ScrollView 
          style={[styles.container, { opacity: fadeAnim }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 头部问候 */}
          <View style={styles.header}>
            <View>
              <Text className="text-base" style={{ color: PARENT_COLORS.textSecondary }}>
                <FontAwesome6 name="hand" size={16} color={PARENT_COLORS.primary} /> 晚上好
              </Text>
              <Text className="text-2xl font-bold mt-1" style={{ color: PARENT_COLORS.textPrimary }}>
                家长用户
              </Text>
            </View>
            <TouchableOpacity style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <FontAwesome6 name="user" size={20} color={PARENT_COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* 睡眠倒退期提醒 - 参考小红书调研 */}
          {regressionAlert?.isRegression && (
            <View style={styles.regressionAlert}>
              <View style={styles.regressionHeader}>
                <FontAwesome6 name="exclamation" size={20} color={PARENT_COLORS.warning} />
                <Text style={styles.regressionTitle}>{child?.name}可能处于睡眠倒退期</Text>
              </View>
              <Text style={styles.regressionText}>{regressionAlert.message}</Text>
              <TouchableOpacity style={styles.regressionBtn}>
                <Text style={styles.regressionBtnText}>查看应对指南</Text>
                <FontAwesome6 name="chevron-right" size={14} color={PARENT_COLORS.warning} />
              </TouchableOpacity>
            </View>
          )}

          {/* 今日睡眠情况卡片 */}
          <View style={styles.sleepCard}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <FontAwesome6 name="bed" size={16} color={PARENT_COLORS.primary} />
                <Text className="text-base font-semibold ml-2" style={{ color: PARENT_COLORS.textPrimary }}>
                  今日睡眠情况
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity onPress={handleRecordSleep} style={styles.recordBtn}>
                  <Text style={styles.recordBtnText}>记录入睡</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRecordWake} style={[styles.recordBtn, styles.recordBtnSecondary]}>
                  <Text style={[styles.recordBtnText, styles.recordBtnTextSecondary]}>记录起床</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 睡眠时间线 */}
            <View style={styles.timeLine}>
              <View className="flex-1 items-center">
                <Text className="text-xs" style={{ color: PARENT_COLORS.textSecondary }}>入睡时间</Text>
                <Text className="text-xl font-bold mt-1" style={{ color: PARENT_COLORS.textPrimary }}>
                  {sleepRecords[0]?.bedtime || '--:--'}
                </Text>
              </View>
              
              <View style={styles.timeLineIndicator}>
                <View style={styles.timeLineDot} />
                <View style={styles.timeLineBar} />
                <Text className="text-xs text-center mt-1" style={{ color: PARENT_COLORS.primary }}>今晚</Text>
              </View>
              
              <View className="flex-1 items-center">
                <Text className="text-xs" style={{ color: PARENT_COLORS.textSecondary }}>起床时间</Text>
                <Text className="text-xl font-bold mt-1" style={{ color: PARENT_COLORS.textPrimary }}>
                  {sleepRecords[0]?.wakeTime || '--:--'}
                </Text>
              </View>
            </View>

            {/* 睡眠统计 */}
            <View className="flex-row mt-4">
              <View className="flex-1 items-center">
                <FontAwesome6 name="clock" size={20} color={PARENT_COLORS.primary} />
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>睡眠时长</Text>
                <Text className="text-sm font-semibold mt-1" style={{ color: PARENT_COLORS.textPrimary }}>
                  {sleepRecords[0]?.duration ? `${Math.floor(sleepRecords[0].duration / 60)}h${sleepRecords[0].duration % 60}m` : '--'}
                </Text>
              </View>
              
              <View className="w-px" style={{ backgroundColor: PARENT_COLORS.border }} />
              
              <View className="flex-1 items-center">
                <FontAwesome6 name="star" size={20} color={PARENT_COLORS.warning} />
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>睡眠质量</Text>
                <Text className="text-sm font-semibold mt-1" style={{ color: PARENT_COLORS.textPrimary }}>
                  {sleepRecords[0]?.quality ? (
                    <View className="flex-row items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesome6
                          key={star}
                          name="star"
                          size={14}
                          color={star <= sleepRecords[0].quality ? '#FFD700' : '#E0E0E0'}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                  ) : '未评分'}
                </Text>
              </View>
              
              <View className="w-px" style={{ backgroundColor: PARENT_COLORS.border }} />
              
              <View className="flex-1 items-center">
                <FontAwesome6 name="chart-line" size={20} color={PARENT_COLORS.success} />
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>睡眠效率</Text>
                <Text className="text-sm font-semibold mt-1" style={{ color: PARENT_COLORS.success }}>
                  {todayStats?.sleepEfficiency || 0}%
                </Text>
              </View>
            </View>
          </View>

          {/* 今晚建议卡片 */}
          <View style={styles.suggestionCard}>
            <View className="flex-row items-center mb-3">
              <View style={[styles.suggestionIcon, { backgroundColor: 'rgba(74, 144, 217, 0.1)' }]}>
                <FontAwesome6 name="lightbulb" size={18} color={PARENT_COLORS.primary} />
              </View>
              <Text className="text-base font-semibold ml-3" style={{ color: PARENT_COLORS.textPrimary }}>
                今晚建议
              </Text>
            </View>
            
            <Text className="text-sm leading-relaxed" style={{ color: PARENT_COLORS.textSecondary }}>
              {suggestion}
            </Text>
            
            <View className="flex-row mt-4">
              <Link href="/reports" className="flex-1 mr-2" asChild>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text className="text-sm font-medium" style={{ color: PARENT_COLORS.primary }}>查看报告</Text>
                  <FontAwesome6 name="arrow-right" size={12} color={PARENT_COLORS.primary} />
                </TouchableOpacity>
              </Link>
              
              <Link href="/settings" className="flex-1 ml-2" asChild>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}>
                  <Text className="text-sm font-medium" style={{ color: PARENT_COLORS.primary }}>调整设置</Text>
                  <FontAwesome6 name="arrow-right" size={12} color={PARENT_COLORS.primary} />
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* 周统计概览 - 新增 */}
          <View style={styles.weekStatsCard}>
            <Text className="text-base font-semibold mb-3" style={{ color: PARENT_COLORS.textPrimary }}>
              本周概览
            </Text>
            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.primary }}>{sleepRecords.length}</Text>
                <Text className="text-xs" style={{ color: PARENT_COLORS.textSecondary }}>记录天数</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.success }}>
                  {todayStats?.avgDuration ? `${Math.floor(todayStats.avgDuration / 60)}h` : '0h'}
                </Text>
                <Text className="text-xs" style={{ color: PARENT_COLORS.textSecondary }}>平均时长</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.warning }}>
                  {(sleepRecords.reduce((sum, r) => sum + r.quality, 0) / Math.max(sleepRecords.length, 1)).toFixed(1)}
                </Text>
                <Text className="text-xs" style={{ color: PARENT_COLORS.textSecondary }}>平均质量</Text>
              </View>
            </View>
          </View>

          {/* 功能入口网格 */}
          <View style={styles.menuGrid}>
            <View className="flex-row">
              <Link href="/reports" className="flex-1" asChild>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIcon, { backgroundColor: 'rgba(82, 196, 26, 0.1)' }]}>
                    <FontAwesome6 name="chart-bar" size={22} color={PARENT_COLORS.success} />
                  </View>
                  <Text className="text-sm font-medium mt-2" style={{ color: PARENT_COLORS.textPrimary }}>睡眠报告</Text>
                  <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>周报/月报</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/guides" className="flex-1" asChild>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIcon, { backgroundColor: 'rgba(139, 126, 200, 0.1)' }]}>
                    <FontAwesome6 name="graduation-cap" size={22} color={PARENT_COLORS.accent} />
                  </View>
                  <Text className="text-sm font-medium mt-2" style={{ color: PARENT_COLORS.textPrimary }}>家长课堂</Text>
                  <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>育儿指导</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <View className="flex-row mt-3">
              <Link href="/" className="flex-1" asChild>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 217, 61, 0.1)' }]}>
                    <FontAwesome6 name="child" size={22} color={PARENT_COLORS.golden} />
                  </View>
                  <Text className="text-sm font-medium mt-2" style={{ color: PARENT_COLORS.textPrimary }}>孩子档案</Text>
                  <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>基本信息</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/subscription" className="flex-1" asChild>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIcon, { backgroundColor: 'rgba(245, 166, 184, 0.1)' }]}>
                    <FontAwesome6 name="crown" size={22} color={PARENT_COLORS.secondary} />
                  </View>
                  <Text className="text-sm font-medium mt-2" style={{ color: PARENT_COLORS.textPrimary }}>会员中心</Text>
                  <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>升级/续费</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* 底部留白 */}
          <View className="h-20" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleepCard: {
    backgroundColor: PARENT_COLORS.cardBg,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLineIndicator: {
    alignItems: 'center',
    flex: 0.5,
  },
  timeLineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PARENT_COLORS.primary,
    marginBottom: 4,
  },
  timeLineBar: {
    width: 60,
    height: 3,
    backgroundColor: PARENT_COLORS.border,
    borderRadius: 2,
  },
  regressionAlert: {
    backgroundColor: 'rgba(250, 173, 20, 0.1)',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: PARENT_COLORS.warning,
  },
  regressionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  regressionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: PARENT_COLORS.textPrimary,
    marginLeft: 8,
  },
  regressionText: {
    fontSize: 13,
    color: PARENT_COLORS.textSecondary,
    lineHeight: 20,
  },
  regressionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  regressionBtnText: {
    fontSize: 13,
    color: PARENT_COLORS.warning,
    fontWeight: '500',
  },
  recordBtn: {
    backgroundColor: PARENT_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  recordBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  recordBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PARENT_COLORS.primary,
  },
  recordBtnTextSecondary: {
    color: PARENT_COLORS.primary,
  },
  suggestionCard: {
    backgroundColor: PARENT_COLORS.cardBg,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PARENT_COLORS.primary,
  },
  weekStatsCard: {
    backgroundColor: PARENT_COLORS.cardBg,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuGrid: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: PARENT_COLORS.cardBg,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
