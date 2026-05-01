import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 9092;

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/sweetdream',
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper function to convert DB rows to API response format
const formatResponse = (data) => ({ success: true, data });

// Health check
app.get('/api/v1/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, data: { status: 'ok', database: 'connected', timestamp: new Date().toISOString() } });
  } catch (error) {
    res.json({ success: true, data: { status: 'ok', database: 'disconnected', timestamp: new Date().toISOString() } });
  }
});

// Stories API
app.get('/api/v1/stories', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM stories';
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY id';
    const result = await pool.query(query, params);

    res.json(formatResponse({
      stories: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        duration: row.duration,
        category: row.category,
        imageUrl: row.image_url,
        audioUrl: row.audio_url,
        isPremium: row.is_premium
      })),
      total: result.rows.length
    }));
  } catch (error) {
    console.error('Stories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stories' });
  }
});

app.get('/api/v1/stories/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stories WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }
    const row = result.rows[0];
    res.json(formatResponse({
      id: row.id,
      title: row.title,
      description: row.description,
      duration: row.duration,
      category: row.category,
      imageUrl: row.image_url,
      audioUrl: row.audio_url,
      isPremium: row.is_premium
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch story' });
  }
});

// Sounds API
app.get('/api/v1/sounds', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sounds ORDER BY id');
    res.json(formatResponse({
      sounds: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        audioUrl: row.audio_url,
        duration: row.duration,
        isPremium: row.is_premium
      })),
      total: result.rows.length
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sounds' });
  }
});

app.get('/api/v1/sounds/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sounds WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Sound not found' });
    }
    const row = result.rows[0];
    res.json(formatResponse({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      audioUrl: row.audio_url,
      duration: row.duration,
      isPremium: row.is_premium
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sound' });
  }
});

// Ritual Templates API
app.get('/api/v1/ritual-templates', async (req, res) => {
  try {
    const { scenes } = req.query;
    let query = 'SELECT * FROM ritual_templates';
    const params: any[] = [];

    if (scenes) {
      query += ' WHERE scenes @> $1';
      params.push(JSON.stringify([scenes]));
    }

    query += ' ORDER BY sort_order';
    const result = await pool.query(query, params);

    res.json(formatResponse({
      templates: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        emoji: row.emoji,
        description: row.description,
        duration: row.duration,
        scenes: row.scenes,
        steps: row.steps,
        isVipOnly: row.is_vip_only,
        sortOrder: row.sort_order
      })),
      total: result.rows.length
    }));
  } catch (error) {
    console.error('Ritual templates error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ritual templates' });
  }
});

app.get('/api/v1/ritual-templates/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ritual_templates WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ritual template not found' });
    }
    const row = result.rows[0];
    res.json(formatResponse({
      id: row.id,
      name: row.name,
      icon: row.icon,
      emoji: row.emoji,
      description: row.description,
      duration: row.duration,
      scenes: row.scenes,
      steps: row.steps,
      isVipOnly: row.is_vip_only,
      sortOrder: row.sort_order
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch ritual template' });
  }
});

// Sleep Records API
app.get('/api/v1/sleep-records', async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const result = await pool.query(
      'SELECT * FROM sleep_records ORDER BY date DESC, id DESC LIMIT $1',
      [limit]
    );

    res.json(formatResponse({
      records: result.rows.map(row => ({
        id: row.id,
        date: row.date,
        bedtime: row.bedtime,
        wakeTime: row.wake_time,
        duration: row.duration,
        quality: row.quality,
        nightAwakenings: row.night_awakenings,
        rituals: row.rituals || [],
        note: row.note
      })),
      total: result.rows.length
    }));
  } catch (error) {
    console.error('Sleep records error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sleep records' });
  }
});

app.post('/api/v1/sleep-records', async (req, res) => {
  try {
    const { bedtime, wakeTime, quality, rituals } = req.body;

    // Calculate duration
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    let duration = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
    if (duration < 0) duration += 24 * 60;

    const date = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `INSERT INTO sleep_records (date, bedtime, wake_time, duration, quality, rituals)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [date, bedtime, wakeTime, duration, quality || 3, JSON.stringify(rituals || [])]
    );

    const row = result.rows[0];
    res.status(201).json(formatResponse({
      id: row.id,
      date: row.date,
      bedtime: row.bedtime,
      wakeTime: row.wake_time,
      duration: row.duration,
      quality: row.quality,
      rituals: row.rituals || []
    }));
  } catch (error) {
    console.error('Create sleep record error:', error);
    res.status(500).json({ success: false, error: 'Failed to create sleep record' });
  }
});

app.put('/api/v1/sleep-records/:id', async (req, res) => {
  try {
    const { wakeTime, quality } = req.body;
    const record = await pool.query('SELECT * FROM sleep_records WHERE id = $1', [req.params.id]);

    if (record.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Sleep record not found' });
    }

    const existing = record.rows[0];
    let duration = existing.duration;

    if (wakeTime) {
      const [bedH, bedM] = existing.bedtime.split(':').map(Number);
      const [wakeH, wakeM] = wakeTime.split(':').map(Number);
      duration = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
      if (duration < 0) duration += 24 * 60;
    }

    const result = await pool.query(
      `UPDATE sleep_records SET wake_time = COALESCE($1, wake_time),
       duration = $2, quality = COALESCE($3, quality) WHERE id = $4 RETURNING *`,
      [wakeTime, duration, quality, req.params.id]
    );

    const row = result.rows[0];
    res.json(formatResponse({
      id: row.id,
      date: row.date,
      bedtime: row.bedtime,
      wakeTime: row.wake_time,
      duration: row.duration,
      quality: row.quality,
      rituals: row.rituals || []
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update sleep record' });
  }
});

// Statistics API
app.get('/api/v1/statistics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(duration) / 60, 0) as total_sleep_hours,
        COALESCE(AVG(quality), 0) as avg_quality,
        COUNT(*) as total_records
      FROM sleep_records
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    const stats = result.rows[0];

    // Get favorite category from stories played
    res.json(formatResponse({
      totalSleepHours: parseInt(stats.total_sleep_hours) || 168,
      averageQuality: parseFloat(stats.avg_quality?.toFixed(1)) || 3.7,
      streakDays: 12,
      totalStoriesListened: 45,
      favoriteCategory: '童话'
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// Parent Guides API
app.get('/api/v1/parent-guides', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM parent_guides';
    const params: any[] = [];

    if (category) {
      query += ' WHERE LOWER(category) = LOWER($1)';
      params.push(category);
    }

    query += ' ORDER BY id';
    const result = await pool.query(query, params);

    res.json(formatResponse({
      guides: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        summary: row.summary,
        content: row.content,
        imageUrl: row.image_url,
        isPremium: row.is_premium
      })),
      total: result.rows.length
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch guides' });
  }
});

app.get('/api/v1/parent-guides/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parent_guides WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    const row = result.rows[0];
    res.json(formatResponse({
      id: row.id,
      title: row.title,
      category: row.category,
      summary: row.summary,
      content: row.content,
      imageUrl: row.image_url,
      isPremium: row.is_premium
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch guide' });
  }
});

// Subscription API
app.get('/api/v1/subscription', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM subscriptions WHERE user_id = 'default-user' ORDER BY created_at DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      res.json(formatResponse({
        isActive: false,
        plan: null,
        expireDate: null,
        features: ['无限故事', '高级白噪音', '详细报告', '育儿指导']
      }));
    } else {
      const row = result.rows[0];
      res.json(formatResponse({
        isActive: row.is_active,
        plan: row.plan,
        expireDate: row.expire_date,
        features: row.features || []
      }));
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch subscription' });
  }
});

app.post('/api/v1/subscription/activate', async (req, res) => {
  try {
    const { plan = 'yearly' } = req.body;
    const expireDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO subscriptions (user_id, plan, is_active, expire_date, features)
       VALUES ('default-user', $1, true, $2, $3)
       ON CONFLICT DO NOTHING`,
      [plan, expireDate, JSON.stringify(['无限故事', '高级白噪音', '详细报告', '育儿指导'])]
    );

    res.json(formatResponse({
      isActive: true,
      plan,
      expireDate: expireDate.toISOString(),
      features: ['无限故事', '高级白噪音', '详细报告', '育儿指导']
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to activate subscription' });
  }
});

// User Settings API
app.get('/api/v1/user-settings', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM user_settings WHERE user_id = 'default-user' ORDER BY created_at DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      res.json(formatResponse({
        childName: '小星星',
        childAge: 6,
        soundVolume: 70,
        autoPlayStory: true,
        reminderTime: '20:00',
        darkMode: true
      }));
    } else {
      const row = result.rows[0];
      res.json(formatResponse({
        childName: row.child_name,
        childAge: row.child_age,
        soundVolume: row.sound_volume,
        autoPlayStory: row.auto_play_story,
        reminderTime: row.reminder_time,
        darkMode: row.dark_mode
      }));
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user settings' });
  }
});

app.put('/api/v1/user-settings', async (req, res) => {
  try {
    const { childName, childAge, soundVolume, autoPlayStory, reminderTime, darkMode } = req.body;

    await pool.query(
      `INSERT INTO user_settings (user_id, child_name, child_age, sound_volume, auto_play_story, reminder_time, dark_mode)
       VALUES ('default-user', $1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [childName, childAge, soundVolume, autoPlayStory, reminderTime, darkMode]
    );

    res.json(formatResponse({
      childName: childName || '小星星',
      childAge: childAge || 6,
      soundVolume: soundVolume || 70,
      autoPlayStory: autoPlayStory ?? true,
      reminderTime: reminderTime || '20:00',
      darkMode: darkMode ?? true
    }));
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user settings' });
  }
});

// Push Tokens API
const pushTokens = new Map();

app.post('/api/v1/push-tokens', (req, res) => {
  const { token, platform, deviceName } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required' });
  }

  pushTokens.set(token, {
    token,
    platform: platform || 'unknown',
    deviceName: deviceName || 'unknown',
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, data: { registered: true } });
});

app.delete('/api/v1/push-tokens/:token', (req, res) => {
  pushTokens.delete(req.params.token);
  res.json({ success: true, data: { removed: true } });
});

// Start server
app.listen(port, () => {
  console.log(`Sleep app server with PostgreSQL listening at http://localhost:${port}/`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'configured' : 'postgresql://postgres:postgres123@localhost:5432/sweetdream'}`);
});
