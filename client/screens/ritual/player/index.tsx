import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FontAwesome6 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 深蓝星空配色
const COLORS = {
  deepBlue: '#0D1B2A',
  navy: '#1B263B',
  twilight: '#415A77',
  starlight: '#E0E1DD',
  golden: '#FFD166',
  accent: '#06D6A0',
  white: '#FFFFFF',
};

interface RitualStep {
  step_id: number;
  name: string;
  icon: string;
  duration: number;
  type: string;
  guide_text?: string;
}

interface Ritual {
  id: number;
  name: string;
  emoji: string;
  iconName: string;
  steps: RitualStep[] | string[];
  duration: number;
  description: string;
  ageRange?: string[];
  suitable?: string;
  popular?: boolean;
}

export default function RitualPlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [ritual, setRitual] = useState<Ritual | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (params.ritual) {
      try {
        const parsedRitual = JSON.parse(params.ritual as string) as Ritual;
        // 将简单的步骤字符串数组转换为详细步骤格式
        if (parsedRitual.steps && parsedRitual.steps.length > 0) {
          const isSimpleFormat = typeof parsedRitual.steps[0] === 'string';
          if (isSimpleFormat) {
            const convertedSteps: RitualStep[] = (parsedRitual.steps as string[]).map((stepName, index) => ({
              step_id: index + 1,
              name: stepName,
              icon: 'moon' as const,
              duration: 60,
              type: 'default' as const,
              guide_text: `请完成 ${stepName} 环节，准备进入下一个步骤`,
            }));
            parsedRitual.steps = convertedSteps;
          }
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRitual(parsedRitual);
      } catch (e) {
        console.error('Failed to parse ritual:', e);
      }
    }
  }, [params.ritual]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && ritual) {
      const steps = ritual.steps as RitualStep[];
      const currentStepDuration = steps[currentStep]?.duration || 60;
      interval = setInterval(() => {
        setElapsed((prev) => {
          const newElapsed = prev + 1;
          if (newElapsed >= currentStepDuration) {
            // Auto advance to next step
            if (currentStep < ritual.steps.length - 1) {
              setCurrentStep((s) => s + 1);
              return 0;
            } else {
              // Ritual complete
              setIsPlaying(false);
            }
          }
          return newElapsed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, ritual, currentStep]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleNextStep = useCallback(() => {
    if (ritual && currentStep < ritual.steps.length - 1) {
      setCurrentStep((s) => s + 1);
      setElapsed(0);
    }
  }, [ritual, currentStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setElapsed(0);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    router.replace('/');
  }, [router]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  if (!ritual || !ritual.steps || ritual.steps.length === 0) {
    return (
      <Screen style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  const currentStepData = ritual.steps[currentStep] as RitualStep;
  const progress = ritual.steps.length > 0 ? (currentStep / ritual.steps.length) * 100 : 0;

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <FontAwesome6 name="chevron-left" size={20} color={COLORS.starlight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>仪式进行中</Text>
        <Text style={styles.headerStep}>
          步骤 {currentStep + 1}/{ritual.steps.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Ritual Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome6 
              name={(currentStepData?.icon || ritual.iconName || 'moon') as any} 
              size={64} 
              color={COLORS.golden} 
            />
          </View>
        </View>

        {/* Step Name */}
        <Text style={styles.stepName}>{currentStepData?.name || '准备中'}</Text>

        {/* Guide Text */}
        <View style={styles.guideCard}>
          <Text style={styles.guideText}>
            {currentStepData?.guide_text || '跟随引导完成这个步骤'}
          </Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.timerLabel}>
            / {Math.floor((currentStepData?.duration || 60) / 60)}:00
          </Text>
        </View>

        {/* All Steps Preview */}
        <View style={styles.stepsPreview}>
          <Text style={styles.stepsTitle}>仪式步骤</Text>
          {(ritual.steps as RitualStep[]).map((step, index) => (
            <View 
              key={step.step_id} 
              style={[
                styles.stepItem,
                index === currentStep && styles.stepItemActive,
                index < currentStep && styles.stepItemCompleted,
              ]}
            >
              <View style={[
                styles.stepDot,
                index === currentStep && styles.stepDotActive,
                index < currentStep && styles.stepDotCompleted,
              ]}>
                {index < currentStep && (
                  <FontAwesome6 name="check" size={10} color={COLORS.white} />
                )}
                {index === currentStep && (
                  <FontAwesome6 name="play" size={10} color={COLORS.white} />
                )}
              </View>
              <Text style={[
                styles.stepItemText,
                index === currentStep && styles.stepItemTextActive,
              ]}>
                {step.name}
              </Text>
              <Text style={styles.stepDuration}>
                {Math.floor(step.duration / 60)}分钟
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlBtn} 
          onPress={handlePrevStep}
          disabled={currentStep === 0}
        >
          <FontAwesome6 
            name="backward-step" 
            size={28} 
            color={currentStep === 0 ? COLORS.twilight : COLORS.starlight} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
          <FontAwesome6 
            name={isPlaying ? 'pause' : 'play'} 
            size={36} 
            color={COLORS.deepBlue} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlBtn} 
          onPress={currentStep === ritual.steps.length - 1 ? handleComplete : handleNextStep}
        >
          <FontAwesome6 
            name={currentStep === ritual.steps.length - 1 ? '-check' : 'forward-step'} 
            size={28} 
            color={COLORS.starlight} 
          />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepBlue,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.starlight,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.starlight,
  },
  headerStep: {
    fontSize: 14,
    color: COLORS.golden,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.navy,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.golden,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.golden,
  },
  stepName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.starlight,
    textAlign: 'center',
    marginBottom: 16,
  },
  guideCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  guideText: {
    fontSize: 16,
    color: COLORS.starlight,
    lineHeight: 24,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.golden,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 18,
    color: COLORS.twilight,
    marginLeft: 4,
  },
  stepsPreview: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 16,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.twilight,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  stepItemActive: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
  },
  stepItemCompleted: {
    opacity: 0.6,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.twilight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepDotActive: {
    backgroundColor: COLORS.golden,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.accent,
  },
  stepItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.starlight,
  },
  stepItemTextActive: {
    fontWeight: '600',
    color: COLORS.golden,
  },
  stepDuration: {
    fontSize: 12,
    color: COLORS.twilight,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
    backgroundColor: COLORS.deepBlue,
    gap: 40,
  },
  controlBtn: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.golden,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
