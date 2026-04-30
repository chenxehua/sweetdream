/**
 * 声音/白噪音页面
 * 基于UI设计文档优化
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

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

interface Sound {
  id: number;
  name: string;
  icon: string;
  description: string;
  audioUrl: string;
  isPremium: boolean;
}

// 图标映射
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'cloud-rain': 'cloud-rain',
  'rain': 'rainy',
  'water': 'water',
  'waves': 'water',
  'tree': 'leaf',
  'forest': 'leaf',
  'fire': 'flame',
  'wind': 'cloudy',
  'droplet': 'water-outline',
};

// 默认图标
const DEFAULT_ICON: keyof typeof Ionicons.glyphMap = 'musical-notes';

// 声音类型（本地兜底数据）
const DEFAULT_SOUNDS: Sound[] = [
  { id: 1, name: '细雨绵绵', icon: 'cloud-rain', description: '温柔的雨滴声，助你入眠', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', isPremium: false },
  { id: 2, name: '海浪轻拍', icon: 'water', description: '听着海浪声，进入梦乡', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', isPremium: false },
  { id: 3, name: '森林虫鸣', icon: 'tree', description: '大自然的虫鸣声，宁静安详', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', isPremium: false },
  { id: 4, name: '温暖壁炉', icon: 'fire', description: '壁炉噼啪声，温馨舒适', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', isPremium: true },
  { id: 5, name: '微风轻拂', icon: 'wind', description: '轻柔的风声，心旷神怡', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', isPremium: true },
  { id: 6, name: '小溪流水', icon: 'droplet', description: '潺潺溪水声，清新自然', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', isPremium: false },
];

// 随机星星位置
const STARS = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: Math.random() * Dimensions.get('window').width,
  top: Math.random() * 150,
  size: Math.random() * 2 + 1,
  opacity: Math.random() * 0.5 + 0.3,
}));

export default function SoundsScreen() {
  const [sounds, setSounds] = useState<Sound[]>(DEFAULT_SOUNDS);
  const [loading, setLoading] = useState(false);
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);

  // 获取图标名称
  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    return ICON_MAP[icon] || DEFAULT_ICON;
  };

  // 从API获取声音列表
  const fetchSounds = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/sounds`);
      const result = await response.json();
      if (result.success && result.data?.sounds && result.data.sounds.length > 0) {
        setSounds(result.data.sounds);
      }
    } catch (error) {
      console.error('Failed to fetch sounds:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSounds();
    }, [])
  );

  // 播放/停止声音
  const handlePlaySound = async (soundItem: Sound) => {
    try {
      // 如果点击的是当前正在播放的声音，则停止
      if (currentSound?.id === soundItem.id && isPlaying) {
        if (audioSound) {
          await audioSound.stopAsync();
          await audioSound.unloadAsync();
          setAudioSound(null);
        }
        setIsPlaying(false);
        setCurrentSound(null);
        return;
      }

      // 停止之前播放的声音
      if (audioSound) {
        await audioSound.stopAsync();
        await audioSound.unloadAsync();
      }

      // 配置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      // 创建新的音频
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: soundItem.audioUrl },
        { shouldPlay: true, isLooping: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            setCurrentSound(null);
          }
        }
      );

      setAudioSound(newSound);
      setCurrentSound(soundItem);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  // 停止播放
  const stopSound = async () => {
    try {
      if (audioSound) {
        await audioSound.stopAsync();
        await audioSound.unloadAsync();
        setAudioSound(null);
      }
      setIsPlaying(false);
      setCurrentSound(null);
    } catch (error) {
      console.error('Failed to stop sound:', error);
    }
  };

  // 调整音量
  const adjustVolume = (id: number, level: number) => {
    setVolumes((prev) => ({ ...prev, [id]: level }));
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
          <Text style={styles.headerTitle}>白噪音</Text>
          <Text style={styles.headerSubtitle}>选择喜欢的声音，帮助入睡</Text>
        </View>

        {/* 声音类型网格 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>声音类型</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={CHILD_COLORS.primary} />
            </View>
          ) : (
            <View style={styles.soundGrid}>
              {sounds.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.soundCard,
                    currentSound?.id === item.id && styles.soundCardActive,
                  ]}
                  onPress={() => handlePlaySound(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.soundIconContainer}>
                    <Ionicons
                      name={getIconName(item.icon)}
                      size={32}
                      color={currentSound?.id === item.id ? '#FFF' : CHILD_COLORS.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.soundName,
                      currentSound?.id === item.id && styles.soundNameActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.soundDesc,
                      currentSound?.id === item.id && styles.soundDescActive,
                    ]}
                  >
                    {item.description}
                  </Text>
                  {currentSound?.id === item.id && isPlaying && (
                    <View style={styles.playingIndicator}>
                      <Ionicons name="volume-high" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 播放控制 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>播放控制</Text>
          <View style={styles.controlCard}>
            {currentSound ? (
              <>
                <View style={styles.nowPlaying}>
                  <Ionicons
                    name={getIconName(currentSound.icon)}
                    size={40}
                    color={CHILD_COLORS.primary}
                  />
                  <View style={styles.nowPlayingInfo}>
                    <Text style={styles.nowPlayingLabel}>正在播放</Text>
                    <Text style={styles.nowPlayingName}>{currentSound.name}</Text>
                  </View>
                </View>
                <View style={styles.controlButtons}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={stopSound}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="stop" size={28} color="#F55" />
                    <Text style={styles.controlText}>停止</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.noPlaying}>
                <Ionicons
                  name="musical-notes"
                  size={40}
                  color={CHILD_COLORS.textMuted}
                />
                <Text style={styles.noPlayingText}>选择一个声音开始播放</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 底部播放栏 */}
      {currentSound && isPlaying && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomPlayer}>
            <View style={styles.bottomInfo}>
              <Ionicons name={getIconName(currentSound.icon)} size={24} color="#FFF" />
              <Text style={styles.bottomName}>{currentSound.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.bottomButton}
              onPress={stopSound}
              activeOpacity={0.8}
            >
              <Ionicons name="pause" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
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
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: CHILD_COLORS.textMuted,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  soundCard: {
    width: '47%',
    backgroundColor: CHILD_COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  soundCardActive: {
    borderColor: CHILD_COLORS.primary,
    backgroundColor: CHILD_COLORS.primary,
  },
  soundIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: CHILD_COLORS.cardText,
    marginBottom: 4,
  },
  soundNameActive: {
    color: '#FFF',
  },
  soundDesc: {
    fontSize: 12,
    color: '#888',
  },
  soundDescActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  playingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  controlCard: {
    backgroundColor: CHILD_COLORS.cardBg,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nowPlayingInfo: {
    marginLeft: 16,
  },
  nowPlayingLabel: {
    fontSize: 12,
    color: '#888',
  },
  nowPlayingName: {
    fontSize: 18,
    fontWeight: '600',
    color: CHILD_COLORS.cardText,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noPlaying: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noPlayingText: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
  },
  bottomPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CHILD_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
