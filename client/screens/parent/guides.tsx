import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9092';

const GUIDE_CATEGORIES = [
  {
    id: 'habit',
    title: '习惯养成',
    icon: 'calendar-check',
    color: '#4A90D9',
  },
  {
    id: 'health',
    title: '健康知识',
    icon: 'heart',
    color: '#F5A6B8',
  },
  {
    id: 'problem',
    title: '问题解决',
    icon: 'lightbulb',
    color: '#7BC47F',
  },
  {
    id: 'environment',
    title: '环境优化',
    icon: 'home',
    color: '#8B7EC8',
  },
];

interface GuideArticle {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  imageUrl: string;
  isPremium: boolean;
}

export default function ParentGuidesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [guides, setGuides] = useState<GuideArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/parent-guides`);
      const result = await response.json();
      if (result.success && result.data?.guides) {
        setGuides(result.data.guides);
      }
    } catch (error) {
      console.error('Failed to fetch guides:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGuides();
    }, [fetchGuides])
  );

  // Filter guides by selected category
  const filteredGuides = selectedCategory
    ? guides.filter(g => g.category.toLowerCase() === selectedCategory)
    : guides;

  const getCategoryInfo = (categoryId: string) => {
    return GUIDE_CATEGORIES.find(c => c.id === categoryId) || GUIDE_CATEGORIES[0];
  };

  useFocusEffect(
    useCallback(() => {
      fetchGuides();
    }, [fetchGuides])
  );

  const handleArticlePress = (article: any) => {
    console.log('Article pressed:', article);
  };

  return (
    <Screen>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>家长课堂</Text>
        <Text style={styles.subtitle}>学习科学的睡眠知识，帮助孩子改善睡眠</Text>

        {/* Category Tabs */}
        <View style={styles.categoryWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {GUIDE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && { backgroundColor: category.color }
                ]}
                onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <FontAwesome6 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Articles List */}
        <View style={styles.articlesSection}>
          {GUIDE_CATEGORIES.map((category) => {
            const isSelected = !selectedCategory || selectedCategory === category.id;
            if (!isSelected) return null;
            
            return (
              <View key={category.id} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
                
                {category.articles.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.articleCard}
                    onPress={() => handleArticlePress(article)}
                  >
                    <View style={styles.articleInfo}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <Text style={styles.articleDuration}>{article.duration}</Text>
                    </View>
                    <FontAwesome6 name="chevron-right" size={16} color="#6B7C93" />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7C93',
    marginBottom: 24,
  },
  categoryWrapper: {
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  articlesSection: {
    gap: 24,
  },
  categorySection: {
    gap: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 4,
  },
  articleDuration: {
    fontSize: 12,
    color: '#6B7C93',
  },
});
