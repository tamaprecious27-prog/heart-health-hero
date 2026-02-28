export type BPStage = 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';

export interface BPClassification {
  stage: BPStage;
  label: string;
  description: string;
  action: string;
  colorClass: string;
  bgClass: string;
}

export function classifyBP(systolic: number, diastolic: number): BPClassification {
  if (systolic > 180 || diastolic > 120) {
    return {
      stage: 'crisis',
      label: 'Hypertensive Crisis',
      description: 'Your blood pressure is dangerously high.',
      action: 'Seek immediate medical attention. Call your doctor or emergency services now.',
      colorClass: 'text-salmon',
      bgClass: 'bg-salmon/15',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      stage: 'stage2',
      label: 'Stage 2 Hypertension',
      description: 'Your blood pressure is high.',
      action: 'Consult your doctor about medication adjustments. Focus on stress reduction and low-sodium diet.',
      colorClass: 'text-salmon',
      bgClass: 'bg-salmon/10',
    };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return {
      stage: 'stage1',
      label: 'Stage 1 Hypertension',
      description: 'Your blood pressure is moderately elevated.',
      action: 'Lifestyle changes recommended: reduce sodium, increase physical activity, manage stress.',
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
    };
  }
  if (systolic >= 120 && diastolic < 80) {
    return {
      stage: 'elevated',
      label: 'Elevated',
      description: 'Your blood pressure is slightly above normal.',
      action: 'Maintain healthy habits. Monitor regularly and focus on diet and exercise.',
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
    };
  }
  return {
    stage: 'normal',
    label: 'Normal',
    description: 'Your blood pressure is within the healthy range.',
    action: 'Keep up the great work! Continue your healthy lifestyle.',
    colorClass: 'text-success',
    bgClass: 'bg-success/10',
  };
}

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 850, 1300, 1900, 2700, 3700, 5000];
export const LEVEL_NAMES = [
  'Heart Starter', 'Pulse Tracker', 'Health Seeker', 'Vital Watcher',
  'Wellness Walker', 'Heart Guardian', 'BP Master', 'Health Hero',
  'Vital Champion', 'CardioChampion'
];

export function getLevelInfo(xp: number) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000;
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return {
    level,
    name: LEVEL_NAMES[level - 1] || 'CardioChampion',
    xp,
    currentThreshold,
    nextThreshold,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

export interface ActivityTemplate {
  title: string;
  description: string;
  category: string;
}

export function getActivitiesForStage(stage: BPStage): ActivityTemplate[] {
  const base: ActivityTemplate[] = [
    { title: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day', category: 'hydration' },
    { title: 'Take a mindful break', description: '5 minutes of deep breathing or meditation', category: 'relaxation' },
  ];

  switch (stage) {
    case 'normal':
      return [
        ...base,
        { title: 'Walk 8,000 steps', description: 'Stay active with a brisk walk', category: 'exercise' },
        { title: 'Eat a heart-healthy meal', description: 'Include fruits, vegetables, and whole grains', category: 'diet' },
      ];
    case 'elevated':
      return [
        ...base,
        { title: 'Walk 7,000 steps', description: 'A moderate walk to keep active', category: 'exercise' },
        { title: 'Try a low-sodium meal', description: 'Reduce salt intake for better BP control', category: 'diet' },
      ];
    case 'stage1':
      return [
        ...base,
        { title: 'Walk 6,000 steps', description: 'Gentle exercise supports heart health', category: 'exercise' },
        { title: 'Prepare a DASH diet meal', description: 'Rich in fruits, veggies, and low-fat dairy', category: 'diet' },
        { title: '10 min deep breathing', description: 'Slow, deep breaths to lower stress', category: 'relaxation' },
      ];
    case 'stage2':
    case 'crisis':
      return [
        ...base,
        { title: 'Gentle 15-min walk', description: 'Light movement at comfortable pace', category: 'exercise' },
        { title: 'Low-sodium meal prep', description: 'Keep sodium under 1,500mg today', category: 'diet' },
        { title: '15 min guided relaxation', description: 'Deep breathing or progressive muscle relaxation', category: 'relaxation' },
        { title: 'Rest and recover', description: 'Take it easy and avoid strenuous activity', category: 'rest' },
      ];
  }
}

export const ALL_BADGES = [
  { key: 'first_log', name: 'First Log', description: 'Logged your first BP reading' },
  { key: 'week_warrior', name: 'Week Warrior', description: '7-day logging streak' },
  { key: 'monthly_master', name: 'Monthly Master', description: '30-day logging streak' },
  { key: 'activity_ace', name: 'Activity Ace', description: 'Completed all activities 5 days in a row' },
  { key: 'trend_setter', name: 'Trend Setter', description: 'BP improved over 2 weeks' },
];
