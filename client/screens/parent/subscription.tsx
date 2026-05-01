import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9092';

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: '月度会员',
    price: '18',
    period: '月',
    features: [
      { text: '全部睡前仪式模板', included: true },
      { text: '基础故事音频', included: true },
      { text: '睡眠记录', included: true },
      { text: '高级冥想内容', included: false },
      { text: '深度睡眠报告', included: false },
      { text: '专家咨询通道', included: false },
    ],
    recommended: false,
  },
  {
    id: 'yearly',
    name: '年度会员',
    price: '38',
    period: '年',
    features: [
      { text: '全部睡前仪式模板', included: true },
      { text: '全部故事音频', included: true },
      { text: '睡眠记录', included: true },
      { text: '高级冥想内容', included: true },
      { text: '深度睡眠报告', included: true },
      { text: '专家咨询优先通道', included: true },
    ],
    recommended: true,
    originalPrice: '168',
  },
];

interface SubscriptionData {
  isActive: boolean;
  plan: string | null;
  expireDate: string | null;
  features: string[];
}

export default function ParentSubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscription`);
      const result = await response.json();
      if (result.success && result.data) {
        setSubscription(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription])
  );

  const handleSubscribe = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscription/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setSubscription(result.data);
      }
    } catch (error) {
      console.error('Failed to activate subscription:', error);
    }
  };

  const handleTryFree = () => {
    console.log('Start free trial');
  };

  return (
    <Screen>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.crownIcon}>
            <FontAwesome6 name="crown" size={32} color="#C9A96E" />
          </View>
          <Text style={styles.title}>高级会员</Text>
          <Text style={styles.subtitle}>专属睡眠专家，更好的睡眠</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>会员专属权益</Text>
          <View style={styles.benefitsList}>
            {['全部睡前仪式模板', '全部故事音频', '高级冥想内容', '个性化CBT-I方案', '深度睡眠报告', '专家咨询优先通道'].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <FontAwesome6 name="check" size={14} color="#52C41A" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plans */}
        <Text style={styles.sectionTitle}>选择会员方案</Text>
        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                plan.recommended && styles.planCardRecommended,
                selectedPlan === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>推荐</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Text style={[styles.planName, plan.recommended && styles.planNameRecommended]}>
                  {plan.name}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, plan.recommended && styles.priceRecommended]}>
                    ¥{plan.price}
                  </Text>
                  <Text style={styles.period}>/{plan.period}</Text>
                </View>
                {plan.originalPrice && (
                  <Text style={styles.originalPrice}>原价¥{plan.originalPrice}/{plan.period}</Text>
                )}
              </View>
              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <FontAwesome6 
                      name={feature.included ? 'check' : 'times'} 
                      size={12} 
                      color={feature.included ? '#52C41A' : '#DCDFE6'} 
                    />
                    <Text style={[
                      styles.featureText,
                      !feature.included && styles.featureTextDisabled
                    ]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>
              {selectedPlan === plan.id && (
                <View style={styles.selectedIndicator}>
                  <FontAwesome6 name="circle-check" size={20} color="#4A90D9" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Yearly Option */}
        <TouchableOpacity style={styles.yearlyOption}>
          <View style={styles.yearlyContent}>
            <FontAwesome6 name="tag" size={16} color="#C9A96E" />
            <View style={styles.yearlyText}>
              <Text style={styles.yearlyTitle}>年费更优惠</Text>
              <Text style={styles.yearlySubtitle}>省¥128，相当于¥27/月</Text>
            </View>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#6B7C93" />
        </TouchableOpacity>

        {/* Current Subscription Status */}
        {subscription?.isActive && (
          <View style={styles.activeSubscription}>
            <FontAwesome6 name="crown" size={20} color="#C9A96E" />
            <View style={styles.activeSubInfo}>
              <Text style={styles.activeSubTitle}>当前已是高级会员</Text>
              <Text style={styles.activeSubDetail}>
                {subscription.plan === 'yearly' ? '年度会员' : '月度会员'} · 到期 {subscription.expireDate?.split('T')[0] || '未知'}
              </Text>
            </View>
          </View>
        )}

        {/* CTA Buttons */}
        {subscription?.isActive ? (
          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe} disabled>
            <Text style={styles.subscribeButtonText}>续费会员</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
              <Text style={styles.subscribeButtonText}>立即开通</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trialButton} onPress={handleTryFree}>
              <Text style={styles.trialButtonText}>先试用7天</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>会员协议</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>退款政策</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>客服</Text>
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  crownIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    position: 'relative',
  },
  planCardRecommended: {
    borderColor: '#4A90D9',
    backgroundColor: '#F0F7FF',
  },
  planCardSelected: {
    borderColor: '#4A90D9',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#4A90D9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  planNameRecommended: {
    color: '#4A90D9',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
  },
  priceRecommended: {
    color: '#4A90D9',
  },
  period: {
    fontSize: 14,
    color: '#6B7C93',
  },
  originalPrice: {
    fontSize: 12,
    color: '#DCDFE6',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#2C3E50',
  },
  featureTextDisabled: {
    color: '#DCDFE6',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  activeSubscription: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  activeSubInfo: {
    flex: 1,
  },
  activeSubTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C9A96E',
  },
  activeSubDetail: {
    fontSize: 13,
    color: '#C9A96E',
    opacity: 0.8,
    marginTop: 2,
  },
  yearlyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  yearlyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yearlyText: {},
  yearlyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C9A96E',
  },
  yearlySubtitle: {
    fontSize: 12,
    color: '#C9A96E',
    opacity: 0.8,
  },
  subscribeButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90D9',
    marginBottom: 24,
  },
  trialButtonText: {
    fontSize: 15,
    color: '#4A90D9',
    fontWeight: '500',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  footerLink: {
    fontSize: 12,
    color: '#6B7C93',
  },
  footerDivider: {
    fontSize: 12,
    color: '#DCDFE6',
  },
});
