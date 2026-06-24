export type ExploreTemplate = {
  id: string
  title: string
  category: 'social' | 'education' | 'promo'
  duration: string
  aspect: string
  gradient: string
}

export type ExploreAvatar = {
  id: string
  name: string
  style: 'professional' | 'casual' | 'animated'
  gradient: string
}

export type ExploreTrack = {
  id: string
  title: string
  artist: string
  genre: 'cinematic' | 'upbeat' | 'calm' | 'corporate'
  duration: string
  mood: string
}

export type ExplorePlatform = {
  id: string
  name: string
  connected: boolean
  color: string
}

export type ExploreScheduleItem = {
  id: string
  title: string
  platform: string
  date: string
  time: string
  status: 'draft' | 'scheduled'
}

export const MOCK_TEMPLATES: ExploreTemplate[] = [
  { id: '1', title: 'Product Launch Reel', category: 'promo', duration: '0:45', aspect: '9:16', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { id: '2', title: 'Tutorial Intro', category: 'education', duration: '1:20', aspect: '16:9', gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
  { id: '3', title: 'Daily Tips Short', category: 'social', duration: '0:30', aspect: '9:16', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { id: '4', title: 'Course Overview', category: 'education', duration: '2:00', aspect: '16:9', gradient: 'linear-gradient(135deg, #14b8a6, #22c55e)' },
  { id: '5', title: 'Flash Sale Countdown', category: 'promo', duration: '0:25', aspect: '1:1', gradient: 'linear-gradient(135deg, #ec4899, #a855f7)' },
  { id: '6', title: 'Behind the Scenes', category: 'social', duration: '0:55', aspect: '9:16', gradient: 'linear-gradient(135deg, #64748b, #334155)' },
]

export const MOCK_AVATARS: ExploreAvatar[] = [
  { id: '1', name: 'Alex — Studio', style: 'professional', gradient: 'linear-gradient(160deg, #1e3a5f, #0f172a)' },
  { id: '2', name: 'Mina — Friendly', style: 'casual', gradient: 'linear-gradient(160deg, #7c3aed, #4c1d95)' },
  { id: '3', name: 'Kai — Presenter', style: 'professional', gradient: 'linear-gradient(160deg, #0369a1, #0c4a6e)' },
  { id: '4', name: 'Luna — Animated', style: 'animated', gradient: 'linear-gradient(160deg, #db2777, #7e22ce)' },
  { id: '5', name: 'Jordan — Casual', style: 'casual', gradient: 'linear-gradient(160deg, #059669, #064e3b)' },
  { id: '6', name: 'Nova — Animated', style: 'animated', gradient: 'linear-gradient(160deg, #ea580c, #9a3412)' },
]

export const MOCK_TRACKS: ExploreTrack[] = [
  { id: '1', title: 'Horizon Rise', artist: 'VokCG Audio', genre: 'cinematic', duration: '2:14', mood: 'Epic' },
  { id: '2', title: 'Soft Focus', artist: 'VokCG Audio', genre: 'calm', duration: '3:02', mood: 'Relaxed' },
  { id: '3', title: 'Momentum', artist: 'VokCG Audio', genre: 'upbeat', duration: '1:48', mood: 'Energetic' },
  { id: '4', title: 'Boardroom', artist: 'VokCG Audio', genre: 'corporate', duration: '2:36', mood: 'Confident' },
  { id: '5', title: 'Golden Hour', artist: 'VokCG Audio', genre: 'cinematic', duration: '2:50', mood: 'Warm' },
  { id: '6', title: 'City Pulse', artist: 'VokCG Audio', genre: 'upbeat', duration: '1:32', mood: 'Urban' },
]

export const MOCK_PLATFORMS: ExplorePlatform[] = [
  { id: 'youtube', name: 'YouTube', connected: true, color: '#ff0000' },
  { id: 'tiktok', name: 'TikTok', connected: false, color: '#00f2ea' },
  { id: 'instagram', name: 'Instagram', connected: false, color: '#e1306c' },
  { id: 'facebook', name: 'Facebook', connected: true, color: '#1877f2' },
]

export const MOCK_SCHEDULE: ExploreScheduleItem[] = [
  { id: '1', title: 'Weekly product tips #12', platform: 'YouTube', date: 'Jun 28', time: '09:00', status: 'scheduled' },
  { id: '2', title: 'Summer promo reel', platform: 'Facebook', date: 'Jul 2', time: '18:30', status: 'draft' },
]
