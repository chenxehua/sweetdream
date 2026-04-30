import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

// Stories table
export const stories = pgTable('stories', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  duration: integer('duration').default(300),
  category: text('category').default('童话'),
  imageUrl: text('image_url'),
  audioUrl: text('audio_url'),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sounds table
export const sounds = pgTable('sounds', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  audioUrl: text('audio_url'),
  duration: integer('duration').default(0),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Ritual templates table
export const ritualTemplates = pgTable('ritual_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  emoji: text('emoji'),
  description: text('description'),
  duration: integer('duration').default(15),
  scenes: jsonb('scenes').$type<string[]>(),
  steps: jsonb('steps').$type<any[]>(),
  isVipOnly: boolean('is_vip_only').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sleep records table
export const sleepRecords = pgTable('sleep_records', {
  id: serial('id').primaryKey(),
  childId: integer('child_id'),
  date: text('date').notNull(), // YYYY-MM-DD
  bedtime: text('bedtime').notNull(), // HH:MM
  wakeTime: text('wake_time').notNull(), // HH:MM
  duration: integer('duration').default(0), // minutes
  quality: integer('quality').default(3), // 1-5
  nightAwakenings: integer('night_awakenings').default(0),
  rituals: jsonb('rituals').$type<string[]>(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Parent guides table
export const parentGuides = pgTable('parent_guides', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  summary: text('summary'),
  content: text('content'),
  imageUrl: text('image_url'),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  plan: text('plan'), // 'monthly' | 'yearly'
  isActive: boolean('is_active').default(false),
  expireDate: timestamp('expire_date'),
  features: jsonb('features').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User settings table
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  childName: text('child_name'),
  childAge: integer('child_age'),
  soundVolume: integer('sound_volume').default(70),
  autoPlayStory: boolean('auto_play_story').default(true),
  reminderTime: text('reminder_time'),
  darkMode: boolean('dark_mode').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
