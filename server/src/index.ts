import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory data store (in production, use database)
const dataStore = {
  stories: [
    {
      id: 1,
      title: "星星的秘密",
      description: "小星星们在天上讲述自己的故事",
      duration: 600,
      category: "童话",
      imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
      audioUrl: "https://example.com/story1.mp3",
      isPremium: false
    },
    {
      id: 2,
      title: "月亮上的小兔子",
      description: "一只小兔子在月亮上等待妈妈的温馨故事",
      duration: 480,
      category: "温馨",
      imageUrl: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=400",
      audioUrl: "https://example.com/story2.mp3",
      isPremium: false
    },
    {
      id: 3,
      title: "云朵棉花糖",
      description: "小狐狸寻找世界上最甜的棉花糖",
      duration: 720,
      category: "冒险",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      audioUrl: "https://example.com/story3.mp3",
      isPremium: true
    },
    {
      id: 4,
      title: "小熊的蜂蜜梦",
      description: "小熊在森林里收集蜂蜜进入甜蜜的梦乡",
      duration: 540,
      category: "童话",
      imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400",
      audioUrl: "https://example.com/story4.mp3",
      isPremium: true
    },
    {
      id: 5,
      title: "海底小精灵",
      description: "在深深的海洋里，住着一群快乐的小精灵",
      duration: 660,
      category: "海洋",
      imageUrl: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400",
      audioUrl: "https://example.com/story5.mp3",
      isPremium: false
    },
    {
      id: 6,
      title: "森林里的萤火虫",
      description: "夏夜里，萤火虫们点亮森林的小灯笼",
      duration: 420,
      category: "自然",
      imageUrl: "https://images.unsplash.com/photo-1470083444695-6b2f22c2a48e?w=400",
      audioUrl: "https://example.com/story6.mp3",
      isPremium: false
    }
  ],
  sounds: [
    {
      id: 1,
      name: "细雨绵绵",
      description: "温柔的雨滴声，助你入眠",
      icon: "cloud-rain",
      duration: 0,
      audioUrl: "https://example.com/rain.mp3",
      isPremium: false
    },
    {
      id: 2,
      name: "海浪轻拍",
      description: "听着海浪声，进入梦乡",
      icon: "water",
      duration: 0,
      audioUrl: "https://example.com/waves.mp3",
      isPremium: false
    },
    {
      id: 3,
      name: "森林虫鸣",
      description: "大自然的虫鸣声，宁静安详",
      icon: "tree",
      duration: 0,
      audioUrl: "https://example.com/forest.mp3",
      isPremium: false
    },
    {
      id: 4,
      name: "温暖壁炉",
      description: "壁炉噼啪声，温馨舒适",
      icon: "fire",
      duration: 0,
      audioUrl: "https://example.com/fireplace.mp3",
      isPremium: true
    },
    {
      id: 5,
      name: "微风轻拂",
      description: "轻柔的风声，心旷神怡",
      icon: "wind",
      duration: 0,
      audioUrl: "https://example.com/wind.mp3",
      isPremium: true
    },
    {
      id: 6,
      name: "小溪流水",
      description: "潺潺溪水声，清新自然",
      icon: "droplet",
      duration: 0,
      audioUrl: "https://example.com/stream.mp3",
      isPremium: false
    }
  ],
  rituals: [
    {
      id: 1,
      name: "洗漱时间",
      description: "刷牙洗脸，清洁干净",
      icon: "tooth",
      duration: 300,
      order: 1,
      tips: ["用温水刷牙", "洗脸要仔细", "换好睡衣"]
    },
    {
      id: 2,
      name: "换衣服",
      description: "换上舒适的睡衣",
      icon: "shirt",
      duration: 180,
      order: 2,
      tips: ["选择纯棉睡衣", "根据天气调整"]
    },
    {
      id: 3,
      name: "喝点水",
      description: "睡前补充水分",
      icon: "cup",
      duration: 60,
      order: 3,
      tips: ["小口慢喝", "不要喝太多"]
    },
    {
      id: 4,
      name: "听故事",
      description: "听一个温馨的故事",
      icon: "book",
      duration: 600,
      order: 4,
      tips: ["选择喜欢的故事", "音量适中"]
    },
    {
      id: 5,
      name: "睡觉时间",
      description: "闭上眼睛，进入梦乡",
      icon: "moon",
      duration: 0,
      order: 5,
      tips: ["保持房间安静", "关灯"]
    }
  ],
  sleepRecords: [
    {
      id: 1,
      date: "2024-01-15",
      bedtime: "21:30",
      wakeTime: "07:00",
      duration: 570,
      quality: 4,
      rituals: ["洗漱", "换衣服", "喝水", "听故事"]
    },
    {
      id: 2,
      date: "2024-01-14",
      bedtime: "21:45",
      wakeTime: "07:15",
      duration: 570,
      quality: 3,
      rituals: ["洗漱", "换衣服", "听故事"]
    },
    {
      id: 3,
      date: "2024-01-13",
      bedtime: "21:00",
      wakeTime: "06:30",
      duration: 570,
      quality: 5,
      rituals: ["洗漱", "换衣服", "喝水", "听故事"]
    },
    {
      id: 4,
      date: "2024-01-12",
      bedtime: "22:00",
      wakeTime: "07:30",
      duration: 570,
      quality: 2,
      rituals: ["洗漱", "换衣服"]
    },
    {
      id: 5,
      date: "2024-01-11",
      bedtime: "21:15",
      wakeTime: "06:45",
      duration: 570,
      quality: 4,
      rituals: ["洗漱", "换衣服", "喝水", "听故事"]
    },
    {
      id: 6,
      date: "2024-01-10",
      bedtime: "21:30",
      wakeTime: "07:00",
      duration: 570,
      quality: 4,
      rituals: ["洗漱", "换衣服", "喝水", "听故事"]
    },
    {
      id: 7,
      date: "2024-01-09",
      bedtime: "21:00",
      wakeTime: "06:30",
      duration: 570,
      quality: 5,
      rituals: ["洗漱", "换衣服", "喝水", "听故事"]
    }
  ],
  parentGuides: [
    {
      id: 1,
      title: "如何建立睡前仪式",
      category: "习惯养成",
      summary: "帮助孩子建立规律的睡前习惯，提高睡眠质量",
      content: "固定的睡前仪式可以帮助孩子建立睡眠条件反射...",
      imageUrl: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=400",
      isPremium: false
    },
    {
      id: 2,
      title: "儿童睡眠时间建议",
      category: "健康知识",
      summary: "不同年龄段儿童所需的睡眠时间参考",
      content: "3-5岁儿童建议每天睡眠10-13小时...",
      imageUrl: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400",
      isPremium: false
    },
    {
      id: 3,
      title: "处理儿童夜醒问题",
      category: "问题解决",
      summary: "孩子夜间醒来时的正确处理方式",
      content: "当孩子在夜间醒来时，应该保持安静...",
      imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400",
      isPremium: true
    },
    {
      id: 4,
      title: "营造良好睡眠环境",
      category: "环境优化",
      summary: "如何为孩子创造最佳的睡眠环境",
      content: "适宜的温度、昏暗的光线、安静的氛围...",
      imageUrl: "https://images.unsplash.com/photo-1513531926349-466f15ec8cc7?w=400",
      isPremium: false
    }
  ],
  subscription: {
    isActive: false,
    plan: null as string | null,
    expireDate: null as string | null,
    features: ["无限故事", "高级白噪音", "详细报告", "育儿指导"]
  },
  userSettings: {
    childName: "小星星",
    childAge: 6,
    soundVolume: 70,
    autoPlayStory: true,
    reminderTime: "20:00",
    darkMode: true
  },
  statistics: {
    totalSleepHours: 168,
    averageQuality: 3.7,
    streakDays: 12,
    totalStoriesListened: 45,
    favoriteCategory: "童话"
  },
  // 睡前仪式模板
  ritualTemplates: [
    {
      id: 1,
      name: "月亮晚安式",
      icon: "moon",
      emoji: "🌙",
      description: "温馨的睡前仪式，帮助孩子放松入睡",
      duration: 15,
      scenes: ["daily"],
      steps: [
        { stepId: 1, name: "洗漱", icon: "tooth", emoji: "🪥", duration: 180, type: "guide", guideText: "现在我们要刷牙洗脸啦，做一个爱干净的好孩子" },
        { stepId: 2, name: "换睡衣", icon: "shirt", emoji: "👕", duration: 120, type: "guide", guideText: "换上舒适的睡衣，准备睡觉啦" },
        { stepId: 3, name: "喝温水", icon: "cup", emoji: "🥛", duration: 60, type: "guide", guideText: "小口喝点温水，润润嗓子" },
        { stepId: 4, name: "听故事", icon: "book", emoji: "📖", duration: 600, type: "audio", audioId: null, guideText: "选择一个喜欢的故事，让声音陪伴你入睡" },
        { stepId: 5, name: "睡觉时间", icon: "moon", emoji: "💤", duration: 0, type: "guide", guideText: "闭上眼睛，进入甜甜的梦乡" }
      ],
      isVipOnly: false,
      sortOrder: 1
    },
    {
      id: 2,
      name: "海洋摇篮式",
      icon: "waves",
      emoji: "🌊",
      description: "适合洗澡日的放松仪式",
      duration: 20,
      scenes: ["bath"],
      steps: [
        { stepId: 1, name: "洗澡", icon: "bath", emoji: "🛁", duration: 300, type: "guide", guideText: "舒舒服服洗个澡，身体暖暖的" },
        { stepId: 2, name: "按摩放松", icon: "hand", emoji: "🤲", duration: 120, type: "guide", guideText: "妈妈给你轻轻按摩，放松身体" },
        { stepId: 3, name: "摇篮曲", icon: "music", emoji: "🎵", duration: 300, type: "audio", audioId: null, guideText: "听一首温柔的摇篮曲" },
        { stepId: 4, name: "睡觉时间", icon: "moon", emoji: "💤", duration: 0, type: "guide", guideText: "闭上眼睛，跟波浪一起摇啊摇" }
      ],
      isVipOnly: false,
      sortOrder: 2
    },
    {
      id: 3,
      name: "森林探险式",
      icon: "tree",
      emoji: "🌳",
      description: "适合活泼好动的孩子",
      duration: 15,
      scenes: ["daily"],
      steps: [
        { stepId: 1, name: "森林散步", icon: "walking", emoji: "🚶", duration: 120, type: "guide", guideText: "在房间里轻轻走一走，就像森林里散步" },
        { stepId: 2, name: "躲进小屋", icon: "home", emoji: "🏠", duration: 60, type: "guide", guideText: "钻进被窝这个小窝里" },
        { stepId: 3, name: "听故事", icon: "book", emoji: "📖", duration: 600, type: "audio", audioId: null, guideText: "听一个森林里的小故事" },
        { stepId: 4, name: "睡觉时间", icon: "moon", emoji: "💤", duration: 0, type: "guide", guideText: "森林里的小动物都睡觉了，晚安" }
      ],
      isVipOnly: true,
      sortOrder: 3
    },
    {
      id: 4,
      name: "星星魔法式",
      icon: "sparkles",
      emoji: "✨",
      description: "快速哄睡的魔法仪式",
      duration: 10,
      scenes: ["quick"],
      steps: [
        { stepId: 1, name: "魔法变装", icon: "magic", emoji: "🪄", duration: 60, type: "guide", guideText: "挥动魔法棒，变出睡衣穿上" },
        { stepId: 2, name: "魔法故事", icon: "book", emoji: "📖", duration: 360, type: "audio", audioId: null, guideText: "听一个神奇的魔法故事" },
        { stepId: 3, name: "数星星", icon: "stars", emoji: "⭐", duration: 120, type: "guide", guideText: "闭上眼睛，数一数天上的星星" },
        { stepId: 4, name: "睡觉时间", icon: "moon", emoji: "💤", duration: 0, type: "guide", guideText: "星星睡觉了，你也要睡觉啦，晚安" }
      ],
      isVipOnly: true,
      sortOrder: 4
    },
    {
      id: 5,
      name: "洗澡放松式",
      icon: "bath",
      emoji: "🛁",
      description: "适合洗澡日的完整仪式",
      duration: 25,
      scenes: ["bath"],
      steps: [
        { stepId: 1, name: "洗澡", icon: "bath", emoji: "🛁", duration: 420, type: "guide", guideText: "舒舒服服洗个热水澡" },
        { stepId: 2, name: "擦香香", icon: "cream", emoji: "🧴", duration: 60, type: "guide", guideText: "擦香香，皮肤滑滑的" },
        { stepId: 3, name: "喝牛奶", icon: "milk", emoji: "🥛", duration: 60, type: "guide", guideText: "喝一杯温热的牛奶" },
        { stepId: 4, name: "听故事", icon: "book", emoji: "📖", duration: 600, type: "audio", audioId: null, guideText: "听一个温馨的睡前故事" },
        { stepId: 5, name: "睡觉时间", icon: "moon", emoji: "💤", duration: 0, type: "guide", guideText: "闭上眼睛，进入甜甜的梦乡" }
      ],
      isVipOnly: false,
      sortOrder: 5
    }
  ]
};

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Stories API
app.get('/api/v1/stories', (req, res) => {
  const { category, premium } = req.query;
  let stories = [...dataStore.stories];

  if (category) {
    stories = stories.filter(s => s.category === category);
  }
  if (premium !== undefined) {
    stories = stories.filter(s => s.isPremium === (premium === 'true'));
  }

  res.json({ success: true, data: { stories, total: stories.length } });
});

app.get('/api/v1/stories/:id', (req, res) => {
  const story = dataStore.stories.find(s => s.id === parseInt(req.params.id));
  if (!story) {
    return res.status(404).json({ success: false, error: 'Story not found' });
  }
  res.json({ success: true, data: story });
});

// Sounds API
app.get('/api/v1/sounds', (req, res) => {
  const { premium } = req.query;
  let sounds = [...dataStore.sounds];

  if (premium !== undefined) {
    sounds = sounds.filter(s => s.isPremium === (premium === 'true'));
  }

  res.json({ success: true, data: { sounds, total: sounds.length } });
});

app.get('/api/v1/sounds/:id', (req, res) => {
  const sound = dataStore.sounds.find(s => s.id === parseInt(req.params.id));
  if (!sound) {
    return res.status(404).json({ success: false, error: 'Sound not found' });
  }
  res.json({ success: true, data: sound });
});

// Rituals API
app.get('/api/v1/rituals', (req, res) => {
  const rituals = [...dataStore.rituals].sort((a, b) => a.order - b.order);
  res.json({ success: true, data: { rituals, total: rituals.length } });
});

// Ritual Templates API - 获取所有仪式模板
app.get('/api/v1/ritual-templates', (req, res) => {
  const { scenes, vipOnly } = req.query;
  let templates = [...dataStore.ritualTemplates].sort((a, b) => a.sortOrder - b.sortOrder);

  if (scenes) {
    templates = templates.filter(t => t.scenes.includes(scenes as string));
  }
  if (vipOnly !== undefined) {
    templates = templates.filter(t => t.isVipOnly === (vipOnly === 'true'));
  }

  res.json({ success: true, data: { templates, total: templates.length } });
});

// 获取单个仪式模板详情
app.get('/api/v1/ritual-templates/:id', (req, res) => {
  const template = dataStore.ritualTemplates.find(t => t.id === parseInt(req.params.id));
  if (!template) {
    return res.status(404).json({ success: false, error: 'Ritual template not found' });
  }
  res.json({ success: true, data: template });
});

// 完成仪式步骤
app.post('/api/v1/rituals/:id/complete', (req, res) => {
  const ritualId = parseInt(req.params.id);
  const ritual = dataStore.rituals.find(r => r.id === ritualId);

  if (!ritual) {
    return res.status(404).json({ success: false, error: 'Ritual not found' });
  }

  res.json({
    success: true,
    data: {
      ritualId,
      ritualName: ritual.name,
      nextRitual: dataStore.rituals.find(r => r.order === ritual.order + 1)
    }
  });
});

// Sleep Records API
app.get('/api/v1/sleep-records', (req, res) => {
  const { startDate, endDate, limit } = req.query;
  let records = [...dataStore.sleepRecords];

  if (startDate) {
    records = records.filter(r => r.date >= startDate);
  }
  if (endDate) {
    records = records.filter(r => r.date <= endDate);
  }

  records = records.sort((a, b) => b.date.localeCompare(a.date));

  if (limit) {
    records = records.slice(0, parseInt(limit as string));
  }

  res.json({ success: true, data: { records, total: records.length } });
});

app.post('/api/v1/sleep-records', (req, res) => {
  const { bedtime, wakeTime, quality, rituals } = req.body;

  const bedtimeMinutes = parseInt(bedtime.split(':')[0]) * 60 + parseInt(bedtime.split(':')[1]);
  const wakeTimeMinutes = parseInt(wakeTime.split(':')[0]) * 60 + parseInt(wakeTime.split(':')[1]);
  const duration = wakeTimeMinutes > bedtimeMinutes
    ? wakeTimeMinutes - bedtimeMinutes
    : 24 * 60 - bedtimeMinutes + wakeTimeMinutes;

  const newRecord = {
    id: dataStore.sleepRecords.length + 1,
    date: new Date().toISOString().split('T')[0],
    bedtime,
    wakeTime,
    duration,
    quality: parseInt(quality) || 3,
    rituals: rituals || []
  };

  dataStore.sleepRecords.unshift(newRecord);

  res.status(201).json({ success: true, data: newRecord });
});

// Update sleep record (e.g., complete with wake time and quality)
app.put('/api/v1/sleep-records/:id', (req, res) => {
  const recordId = parseInt(req.params.id);
  const index = dataStore.sleepRecords.findIndex(r => r.id === recordId);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Sleep record not found' });
  }

  const { wakeTime, quality } = req.body;
  const record = dataStore.sleepRecords[index];

  if (wakeTime) {
    record.wakeTime = wakeTime;
    // Recalculate duration
    const bedtimeMinutes = parseInt(record.bedtime.split(':')[0]) * 60 + parseInt(record.bedtime.split(':')[1]);
    const wakeTimeMinutes = parseInt(wakeTime.split(':')[0]) * 60 + parseInt(wakeTime.split(':')[1]);
    record.duration = wakeTimeMinutes > bedtimeMinutes
      ? wakeTimeMinutes - bedtimeMinutes
      : 24 * 60 - bedtimeMinutes + wakeTimeMinutes;
  }

  if (quality !== undefined) {
    record.quality = parseInt(quality);
  }

  dataStore.sleepRecords[index] = record;

  res.json({ success: true, data: record });
});

// Statistics API
app.get('/api/v1/statistics', (req, res) => {
  res.json({ success: true, data: dataStore.statistics });
});

// Parent Guides API
app.get('/api/v1/parent-guides', (req, res) => {
  const { category } = req.query;
  let guides = [...dataStore.parentGuides];

  if (category) {
    guides = guides.filter(g => g.category === category);
  }

  res.json({ success: true, data: { guides, total: guides.length } });
});

app.get('/api/v1/parent-guides/:id', (req, res) => {
  const guide = dataStore.parentGuides.find(g => g.id === parseInt(req.params.id));
  if (!guide) {
    return res.status(404).json({ success: false, error: 'Guide not found' });
  }
  res.json({ success: true, data: guide });
});

// Subscription API
app.get('/api/v1/subscription', (req, res) => {
  res.json({ success: true, data: dataStore.subscription });
});

app.post('/api/v1/subscription/activate', (req, res) => {
  const { plan } = req.body;

  dataStore.subscription = {
    isActive: true,
    plan: plan || 'yearly',
    expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    features: dataStore.subscription.features
  };

  res.json({ success: true, data: dataStore.subscription });
});

// User Settings API
app.get('/api/v1/user-settings', (req, res) => {
  res.json({ success: true, data: dataStore.userSettings });
});

app.put('/api/v1/user-settings', (req, res) => {
  const settings = req.body;
  dataStore.userSettings = { ...dataStore.userSettings, ...settings };
  res.json({ success: true, data: dataStore.userSettings });
});

app.listen(port, () => {
  console.log(`Sleep app server listening at http://localhost:${port}/`);
});
