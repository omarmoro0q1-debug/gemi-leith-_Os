/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppCategory = 'system' | 'social' | 'media' | 'tools' | 'games';

export type MaterialType = 'glass' | 'metal' | 'organic' | 'particle' | 'light' | 'stone';

export type PulseType = 'spin' | 'pulsate' | 'ripple' | 'sparkle' | 'static';

export interface AppItem {
  id: string;
  name: string;
  icon: string; // The standard icon keyword (e.g. "Camera", "MessageCircle")
  category: AppCategory;
  dominantColor: string; // hex representation
  baseMaterial: MaterialType;
  pulseType: PulseType;
  glowColor: string; // glow color
  usageCount: number; // for predictive cache
  lastUsedHour: number; // 0-23
}

export interface Telemetry {
  cpuTemp: number; // in Celsius
  cpuLoad: number; // 0 to 100 percentage
  fps: number; // current frames per second rendering
  ramUsage: number; // 0 to 100 percentage
  batteryLevel: number; // 0 to 100 percentage
  isCharging: boolean;
  touchPressure: number; // 0.0 to 1.0 simulated
  ambientLight: number; // Lux (simulated)
}

export interface OSConfig {
  mode: 'aod' | 'lock' | 'normal' | 'warrior';
  isDnd: boolean;
  frameRateTarget: '60' | '120';
  boostAudio: boolean;
  savePower: boolean;
  systemBreathInterval: number; // in ms, default 4000
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  thinking?: string;
  timestamp: string;
}

export interface ForgedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
}
