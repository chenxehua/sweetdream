/**
 * 故事盒页面 - 睡前故事音频播放
 * 基于UI设计文档和原型优化
 * 参考：儿童端故事盒页面设计
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

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

interface Story {
  id: number;
  title: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  category: string;
  ageRange: string;
  isPlaying?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface AgeGroup {
  id: string;
  label: string;
  icon: string;
}

// 分类配置 - 映射到服务端类别
const CATEGORIES: Category[] = [
  { id: 'all', name: '全部', icon: 'grid' },
  { id: '童话', name: '童话', icon: 'star' },
  { id: '温馨', name: '温馨', icon: 'heart' },
  { id: '冒险', name: '冒险', icon: 'airplane' },
  { id: '海洋', name: '海洋', icon: 'water' },
  { id: '自然', name: '自然', icon: 'leaf' },
];

// 年龄组配置
const AGE_GROUPS: AgeGroup[] = [
  { id: '0-6m', label: '0-6月', icon: 'baby' },
  { id: '6-12m', label: '6-12月', icon: 'happy' },
  { id: '1-3y', label: '1-3岁', icon: 'happy-outline' },
  { id: '3-6y', label: '3-6岁', icon: 'school' },
  { id: '6-12y', label: '6-12岁', icon: 'book' },
];

// 示例故事数据 - 使用公开可用的示例音频
const SAMPLE_STORIES: Story[] = [
  { id: 1, title: '小熊的月亮之旅', coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 300, category: 'animal', ageRange: '1-3y' },
  { id: 2, title: '星星国的公主', coverUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&h=200&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 420, category: 'dream', ageRange: '3-6y' },
  { id: 3, title: '勇敢的小火车', coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 360, category: 'adventure', ageRange: '3-6y' },
  { id: 4, title: '小兔子的大冒险', coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 480, category: 'animal', ageRange: '1-3y' },
  { id: 5, title: '魔法森林的秘密', coverUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 540, category: 'dream', ageRange: '3-6y' },
  { id: 6, title: '好朋友大比拼', coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 300, category: 'friendship', ageRange: '6-12y' },
];

export default function StoriesScreen() {
  const [stories, setStories] = useState<Story[]>(SAMPLE_STORIES);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAge, setSelectedAge] = useState('3-6y');
  const [playingStoryId, setPlayingStoryId] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchStories();
    }, [selectedCategory, selectedAge])
  );

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/stories?category=${selectedCategory}`);
      const result = await response.json();
      if (result.success && result.data?.stories && result.data.stories.length > 0) {
        const formattedStories = result.data.stories.map((s: any) => ({
          id: s.id,
          title: s.title,
          coverUrl: s.imageUrl,
          audioUrl: s.audioUrl || '',
          duration: s.duration || 300,
          category: s.category || 'all',
          ageRange: '3-6y',
        }));
        setStories(formattedStories);
      }
      // If API returns empty, keep using SAMPLE_STORIES
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      // Fallback to sample data on error
    } finally {
      setLoading(false);
    }
  };

  const handlePlayStory = async (story: Story) => {
    try {
      if (playingStoryId === story.id) {
        // 停止播放
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
          setPlayingStoryId(null);
        }
      } else {
        // 开始播放新故事
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
        
        // 配置音频播放模式
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
        
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: story.audioUrl },
          { shouldPlay: true },
          (status) => {
            // 播放完成时自动停止
            if (status.isLoaded && status.didJustFinish) {
              setPlayingStoryId(null);
              setSound(null);
            }
          }
        );
        setSound(newSound);
        setPlayingStoryId(story.id);
      }
    } catch (error) {
      console.error('Failed to play story:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}分钟`;
  };

  const getCategoryIcon = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'grid': 'grid',
      'leaf': 'leaf',
      'airplane': 'airplane',
      'heart': 'heart',
      'star': 'star',
    };
    return iconMap[icon] || 'grid';
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={getCategoryIcon(item.icon) as any}
        size={14}
        color={selectedCategory === item.id ? '#FFF' : '#666'}
      />
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item.id && styles.categoryChipTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAgeItem = ({ item }: { item: AgeGroup }) => (
    <TouchableOpacity
      style={[
        styles.ageChip,
        selectedAge === item.id && styles.ageChipActive,
      ]}
      onPress={() => setSelectedAge(item.id)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.ageChipText,
          selectedAge === item.id && styles.ageChipTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderStoryItem = ({ item }: { item: Story }) => {
    const isPlaying = playingStoryId === item.id;
    return (
      <TouchableOpacity
        style={styles.storyCard}
        onPress={() => handlePlayStory(item)}
        activeOpacity={0.8}
      >
        <View style={styles.storyCover}>
          <Image
            source={{ uri: item.coverUrl }}
            style={styles.storyImage}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color="#FFF"
              />
            </View>
          </View>
        </View>
        <View style={styles.storyInfo}>
          <Text style={styles.storyTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.storyDuration}>{formatDuration(item.duration)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>故事盒</Text>
      </View>

      {/* 分类筛选 */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* 年龄筛选 */}
      <View style={styles.ageSection}>
        <FlatList
          horizontal
          data={AGE_GROUPS}
          renderItem={renderAgeItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ageList}
        />
      </View>

      {/* 故事列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CHILD_COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.storyRow}
          contentContainerStyle={styles.storyList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 底部播放栏 */}
      {playingStoryId && (
        <View style={styles.playingBar}>
          <View style={styles.playingInfo}>
            <Ionicons name="musical-notes" size={20} color={CHILD_COLORS.primary} />
            <Text style={styles.playingText} numberOfLines={1}>
              {stories.find((s) => s.id === playingStoryId)?.title}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => handlePlayStory(stories.find((s) => s.id === playingStoryId)!)}
          >
            <Ionicons name="pause" size={20} color="#FFF" />
            <Text style={styles.stopButtonText}>停止</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  filterSection: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: CHILD_COLORS.cardBg,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: CHILD_COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  ageSection: {
    marginBottom: 12,
  },
  ageList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  ageChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginRight: 8,
  },
  ageChipActive: {
    backgroundColor: CHILD_COLORS.golden,
  },
  ageChipText: {
    fontSize: 12,
    color: CHILD_COLORS.textMuted,
  },
  ageChipTextActive: {
    color: CHILD_COLORS.bgStart,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRow: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  storyList: {
    paddingBottom: 100,
  },
  storyCard: {
    width: '48%',
    backgroundColor: CHILD_COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  storyCover: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CHILD_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInfo: {
    padding: 12,
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: CHILD_COLORS.cardText,
    marginBottom: 4,
  },
  storyDuration: {
    fontSize: 12,
    color: '#888',
  },
  playingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CHILD_COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  playingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playingText: {
    fontSize: 14,
    color: CHILD_COLORS.cardText,
    flex: 1,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F55',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  stopButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
});
