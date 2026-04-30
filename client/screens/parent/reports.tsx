/**
 * 睡眠报告页面 - 家长端
 * 基于UI设计文档优化：
 * - 数据可视化报告
 * - 周报/月报
 * - 趋势分析
 * - 个性化建议
 * 参考：PRD文档 - 睡眠数据报告 + 小红书用户调研
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 家长端配色系统
const PARENT_COLORS = {
  primary: '#4A90D9',
  secondary: '#F5A6B8',
  accent: '#8B7EC8',
  success: '#52C41A',
  warning: '#FAAD14',
  danger: '#F5222D',
  bgLight: '#F8F9FB',
  cardBg: '#FFFFFF',
  textPrimary: '#2C3E50',
  textSecondary: '#6B7C93',
  border: '#E8ECF0',
  golden: '#FFD93D',
};

// 周报类型
type ReportType = 'week' | 'month';

interface SleepData {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
  duration: number; // 分钟
}

interface WeeklyStats {
  avgBedtime: string;
  avgWakeTime: string;
  avgDuration: number;
  avgQuality: number;
  totalRecords: number;
  bestDay: string;
  worstDay: string;
}

export default function ReportsScreen() {
  const [reportType, setReportType] = useState<ReportType>('week');
  const [weeklyData, setWeeklyData] = useState<SleepData[]>([]);
  const [monthlyData, setMonthlyData] = useState<SleepData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  // 计算统计数据
  const calculateStats = (data: SleepData[], type: 'week' | 'month'): WeeklyStats => {
    if (data.length === 0) {
      return {
        avgBedtime: '--:--',
        avgWakeTime: '--:--',
        avgDuration: 0,
        avgQuality: 0,
        totalRecords: 0,
        bestDay: '-',
        worstDay: '-',
      };
    }

    // 计算平均入睡时间
    const totalBedMins = data.reduce((sum, d) => {
      const [h, m] = d.bedtime.split(':').map(Number);
      return sum + h * 60 + m;
    }, 0);
    const avgBedMins = totalBedMins / data.length;
    const avgBedtime = `${Math.floor(avgBedMins / 60).toString().padStart(2, '0')}:${Math.floor(avgBedMins % 60).toString().padStart(2, '0')}`;

    // 计算平均起床时间
    const totalWakeMins = data.reduce((sum, d) => {
      const [h, m] = d.wakeTime.split(':').map(Number);
      return sum + h * 60 + m;
    }, 0);
    const avgWakeMins = totalWakeMins / data.length;
    const avgWakeTime = `${Math.floor(avgWakeMins / 60).toString().padStart(2, '0')}:${Math.floor(avgWakeMins % 60).toString().padStart(2, '0')}`;

    // 计算平均时长和品质
    const avgDuration = Math.round(data.reduce((sum, d) => sum + d.duration, 0) / data.length);
    const avgQuality = Math.round((data.reduce((sum, d) => sum + d.quality, 0) / data.length) * 10) / 10;

    // 找出最好和最差的一天
    const sortedByQuality = [...data].sort((a, b) => b.quality - a.quality);
    const bestDay = sortedByQuality[0]?.date || '-';
    const worstDay = sortedByQuality[sortedByQuality.length - 1]?.date || '-';

    return {
      avgBedtime,
      avgWakeTime,
      avgDuration,
      avgQuality,
      totalRecords: data.length,
      bestDay,
      worstDay,
    };
  };

  // 生成建议
  const generateSuggestions = (stats: WeeklyStats, data: SleepData[]): string[] => {
    const suggestions: string[] = [];

    // 睡眠时长建议
    if (stats.avgDuration < 480) {
      suggestions.push('睡眠时长偏少，建议提前15-30分钟开始睡前仪式，帮助孩子更早入睡。');
    } else if (stats.avgDuration > 600) {
      suggestions.push('睡眠时间充足，但注意不要睡得太晚，保持规律的作息时间很重要。');
    } else {
      suggestions.push('睡眠时长良好，继续保持！');
    }

    // 入睡时间建议
    if (stats.avgBedtime > '21:30') {
      suggestions.push('入睡时间偏晚，可以尝试提前10分钟开始睡前仪式，养成早睡习惯。');
    }

    // 睡眠质量建议
    if (stats.avgQuality < 3) {
      suggestions.push('近期睡眠质量有波动，建议检查是否有噪音、光线等干扰因素，或考虑是否处于睡眠倒退期。');
    } else if (stats.avgQuality >= 4) {
      suggestions.push('睡眠质量优秀！坚持当前的睡前仪式和作息习惯。');
    }

    // 夜醒建议
    const nightAwakeningDays = data.filter(d => d.quality < 3).length;
    if (nightAwakeningDays > 2) {
      suggestions.push('近期夜醒次数较多，可能需要检查睡前饮食、白天活动量等因素。');
    }

    return suggestions;
  };

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      // 首先尝试从API获取数据
      const response = await fetch(`${API_BASE}/api/v1/sleep-records?limit=30`);
      const result = await response.json();

      if (result.success && result.data?.records && result.data.records.length > 0) {
        // 转换API数据格式
        const apiRecords: SleepData[] = result.data.records.map((r: any) => ({
          date: r.date,
          bedtime: r.bedtime,
          wakeTime: r.wakeTime,
          quality: r.quality,
          duration: r.duration,
        }));

        // 保存到本地存储
        await AsyncStorage.setItem('sleep_records', JSON.stringify(apiRecords));

        // 生成周数据（最近7天）
        const weekData = apiRecords.slice(0, 7);
        setWeeklyData(weekData);
        setWeeklyStats(calculateStats(weekData, 'week'));
        setSuggestions(generateSuggestions(calculateStats(weekData, 'week'), weekData));

        // 生成月数据（最近30天）
        const monthData = apiRecords.slice(0, 30);
        setMonthlyData(monthData);
      } else {
        // 从本地存储获取数据
        const localRecords = await AsyncStorage.getItem('sleep_records');

        if (localRecords) {
          const records: SleepData[] = JSON.parse(localRecords);

          // 生成周数据（最近7天）
          const weekData = records.slice(0, 7);
          setWeeklyData(weekData);
          setWeeklyStats(calculateStats(weekData, 'week'));
          setSuggestions(generateSuggestions(calculateStats(weekData, 'week'), weekData));

          // 生成月数据（最近30天）
          const monthData = records.slice(0, 30);
          setMonthlyData(monthData);
        } else {
          // 模拟数据
          const mockWeekData: SleepData[] = [
            { date: '01-15', bedtime: '21:30', wakeTime: '07:30', quality: 4, duration: 540 },
            { date: '01-14', bedtime: '21:45', wakeTime: '07:35', quality: 3, duration: 530 },
            { date: '01-13', bedtime: '21:15', wakeTime: '07:20', quality: 5, duration: 545 },
            { date: '01-12', bedtime: '21:00', wakeTime: '07:15', quality: 4, duration: 555 },
            { date: '01-11', bedtime: '22:00', wakeTime: '07:40', quality: 3, duration: 520 },
            { date: '01-10', bedtime: '21:30', wakeTime: '07:30', quality: 4, duration: 540 },
            { date: '01-09', bedtime: '21:20', wakeTime: '07:25', quality: 5, duration: 545 },
          ];

          const mockMonthData: SleepData[] = Array.from({ length: 30 }, (_, i) => ({
            date: `01-${(15 - i).toString().padStart(2, '0')}`,
            bedtime: `${21 + Math.floor(Math.random() * 2)}:${(Math.random() * 30).toFixed(0).padStart(2, '0')}`,
            wakeTime: `${7 + Math.floor(Math.random() * 2)}:${(Math.random() * 30).toFixed(0).padStart(2, '0')}`,
            quality: Math.floor(Math.random() * 3) + 3,
            duration: 500 + Math.floor(Math.random() * 60),
          }));

          setWeeklyData(mockWeekData);
          setWeeklyStats(calculateStats(mockWeekData, 'week'));
          setMonthlyData(mockMonthData);
          setSuggestions(generateSuggestions(calculateStats(mockWeekData, 'week'), mockWeekData));
        }
      }
    } catch (error) {
      console.error('获取报告数据失败:', error);
      // 回退到模拟数据
      const mockWeekData: SleepData[] = [
        { date: '01-15', bedtime: '21:30', wakeTime: '07:30', quality: 4, duration: 540 },
        { date: '01-14', bedtime: '21:45', wakeTime: '07:35', quality: 3, duration: 530 },
        { date: '01-13', bedtime: '21:15', wakeTime: '07:20', quality: 5, duration: 545 },
        { date: '01-12', bedtime: '21:00', wakeTime: '07:15', quality: 4, duration: 555 },
        { date: '01-11', bedtime: '22:00', wakeTime: '07:40', quality: 3, duration: 520 },
        { date: '01-10', bedtime: '21:30', wakeTime: '07:30', quality: 4, duration: 540 },
        { date: '01-09', bedtime: '21:20', wakeTime: '07:25', quality: 5, duration: 545 },
      ];

      setWeeklyData(mockWeekData);
      setWeeklyStats(calculateStats(mockWeekData, 'week'));
      setSuggestions(generateSuggestions(calculateStats(mockWeekData, 'week'), mockWeekData));
    }
  }, []);

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

  const currentStats = reportType === 'week' ? weeklyStats : calculateStats(monthlyData, 'month');
  const currentData = reportType === 'week' ? weeklyData : monthlyData;

  return (
    <Screen className="flex-1" style={{ backgroundColor: PARENT_COLORS.bgLight }}>
      <SafeAreaView className="flex-1">
        <Animated.ScrollView 
          style={[styles.container, { opacity: fadeAnim }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 头部 */}
          <View style={styles.header}>
            <Link href="/parent" className="absolute left-5">
              <FontAwesome6 name="arrow-left" size={20} color={PARENT_COLORS.textPrimary} />
            </Link>
            <Text className="text-lg font-bold" style={{ color: PARENT_COLORS.textPrimary }}>
              睡眠报告
            </Text>
            <View className="w-6" />
          </View>

          {/* 报告类型切换 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, reportType === 'week' && styles.tabActive]}
              onPress={() => setReportType('week')}
            >
              <Text style={[styles.tabText, reportType === 'week' && styles.tabTextActive]}>
                周报
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, reportType === 'month' && styles.tabActive]}
              onPress={() => setReportType('month')}
            >
              <Text style={[styles.tabText, reportType === 'month' && styles.tabTextActive]}>
                月报
              </Text>
            </TouchableOpacity>
          </View>

          {/* 睡眠时长趋势图 - 简化版 */}
          <View style={styles.chartCard}>
            <Text className="text-base font-semibold mb-4" style={{ color: PARENT_COLORS.textPrimary }}>
              睡眠时长趋势
            </Text>
            <View style={styles.chartContainer}>
              {currentData.map((day, index) => {
                const heightPercent = (day.duration / 600) * 100; // 假设目标10小时
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <Animated.View 
                        style={[
                          styles.bar, 
                          { 
                            height: `${Math.min(heightPercent, 100)}%`,
                            backgroundColor: day.duration >= 540 ? PARENT_COLORS.success : 
                                           day.duration >= 480 ? PARENT_COLORS.warning : PARENT_COLORS.danger,
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barLabel}>{day.date.split('-')[1]}</Text>
                  </View>
                );
              })}
            </View>
            <View className="flex-row justify-center mt-4">
              <View className="flex-row items-center mr-4">
                <View style={[styles.legendDot, { backgroundColor: PARENT_COLORS.success }]} />
                <Text className="text-xs ml-1" style={{ color: PARENT_COLORS.textSecondary }}>充足</Text>
              </View>
              <View className="flex-row items-center mr-4">
                <View style={[styles.legendDot, { backgroundColor: PARENT_COLORS.warning }]} />
                <Text className="text-xs ml-1" style={{ color: PARENT_COLORS.textSecondary }}>偏少</Text>
              </View>
              <View className="flex-row items-center">
                <View style={[styles.legendDot, { backgroundColor: PARENT_COLORS.danger }]} />
                <Text className="text-xs ml-1" style={{ color: PARENT_COLORS.textSecondary }}>不足</Text>
              </View>
            </View>
          </View>

          {/* 睡眠质量趋势图 */}
          <View style={styles.chartCard}>
            <Text className="text-base font-semibold mb-4" style={{ color: PARENT_COLORS.textPrimary }}>
              睡眠质量趋势
            </Text>
            <View style={styles.qualityContainer}>
              {currentData.map((day, index) => (
                <View key={index} style={styles.qualityItem}>
                  <Text style={styles.qualityValue}>{day.quality}</Text>
                  <View style={styles.qualityStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome6 
                        key={star}
                        name="star" 
                        size={10} 
                        color={star <= day.quality ? PARENT_COLORS.warning : PARENT_COLORS.border} 
                      />
                    ))}
                  </View>
                  <Text style={styles.qualityLabel}>{day.date.split('-')[1]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 统计数据卡片 */}
          <View style={styles.statsCard}>
            <Text className="text-base font-semibold mb-4" style={{ color: PARENT_COLORS.textPrimary }}>
              {reportType === 'week' ? '本周' : '本月'}统计
            </Text>
            <View className="flex-row flex-wrap">
              <View style={styles.statItem}>
                <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.primary }}>
                  {currentStats?.avgBedtime || '--:--'}
                </Text>
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>平均入睡</Text>
              </View>
              <View style={styles.statItem}>
                <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.primary }}>
                  {currentStats?.avgWakeTime || '--:--'}
                </Text>
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>平均起床</Text>
              </View>
              <View style={styles.statItem}>
                <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.success }}>
                  {currentStats?.avgDuration ? `${Math.floor(currentStats.avgDuration / 60)}h${currentStats.avgDuration % 60}m` : '0h'}
                </Text>
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>平均时长</Text>
              </View>
              <View style={styles.statItem}>
                <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.warning }}>
                  {currentStats?.avgQuality || 0}
                </Text>
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.textSecondary }}>平均质量</Text>
              </View>
            </View>
            <View className="flex-row mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: PARENT_COLORS.border }}>
              <View className="flex-1 flex-row items-center">
                <FontAwesome6 name="trophy" size={16} color={PARENT_COLORS.success} />
                <Text className="text-xs ml-2" style={{ color: PARENT_COLORS.textSecondary }}>
                  最佳日: {currentStats?.bestDay || '-'}
                </Text>
              </View>
              <View className="flex-1 flex-row items-center">
                <FontAwesome6 name="exclamation" size={16} color={PARENT_COLORS.warning} />
                <Text className="text-xs ml-2" style={{ color: PARENT_COLORS.textSecondary }}>
                  需关注: {currentStats?.worstDay || '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* 改善建议 */}
          <View style={styles.suggestionsCard}>
            <View className="flex-row items-center mb-4">
              <View style={[styles.suggestionIcon, { backgroundColor: 'rgba(74, 144, 217, 0.1)' }]}>
                <FontAwesome6 name="lightbulb" size={18} color={PARENT_COLORS.primary} />
              </View>
              <Text className="text-base font-semibold ml-3" style={{ color: PARENT_COLORS.textPrimary }}>
                改善建议
              </Text>
            </View>
            {suggestions.map((suggestion, index) => (
              <View key={index} className="flex-row items-start mb-3">
                <View style={[styles.suggestionBullet, { backgroundColor: PARENT_COLORS.primary }]}>
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-sm ml-3" style={{ color: PARENT_COLORS.textSecondary }}>
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>

          {/* 与同龄对比 - 新增功能 */}
          <View style={styles.compareCard}>
            <View className="flex-row items-center mb-4">
              <FontAwesome6 name="users" size={18} color={PARENT_COLORS.accent} />
              <Text className="text-base font-semibold ml-2" style={{ color: PARENT_COLORS.textPrimary }}>
                与同龄孩子对比
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-sm" style={{ color: PARENT_COLORS.textSecondary }}>
                  睡眠时长
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="flex-1 h-2 rounded-full" style={{ backgroundColor: PARENT_COLORS.border }}>
                    <View className="h-full rounded-full" style={{ width: '75%', backgroundColor: PARENT_COLORS.success }} />
                  </View>
                  <Text className="text-xs ml-2" style={{ color: PARENT_COLORS.success }}>优于75%</Text>
                </View>
              </View>
            </View>
            <View className="flex-row items-center mt-3">
              <View className="flex-1">
                <Text className="text-sm" style={{ color: PARENT_COLORS.textSecondary }}>
                  入睡时间
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="flex-1 h-2 rounded-full" style={{ backgroundColor: PARENT_COLORS.border }}>
                    <View className="h-full rounded-full" style={{ width: '60%', backgroundColor: PARENT_COLORS.primary }} />
                  </View>
                  <Text className="text-xs ml-2" style={{ color: PARENT_COLORS.primary }}>优于60%</Text>
                </View>
              </View>
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: PARENT_COLORS.cardBg,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: PARENT_COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: PARENT_COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: PARENT_COLORS.cardBg,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 10,
    color: PARENT_COLORS.textSecondary,
    marginTop: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  qualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  qualityItem: {
    alignItems: 'center',
    width: `${100 / 7}%`,
    marginBottom: 8,
  },
  qualityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PARENT_COLORS.textPrimary,
  },
  qualityStars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  qualityLabel: {
    fontSize: 10,
    color: PARENT_COLORS.textSecondary,
    marginTop: 2,
  },
  statsCard: {
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
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  suggestionsCard: {
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
  suggestionBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareCard: {
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
});
