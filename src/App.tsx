/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppItem, Telemetry, OSConfig } from "./types";
import CortexBackground from "./components/CortexBackground";
import WarriorController from "./components/WarriorController";
import AppDrawer from "./components/AppDrawer";
import ForgingStudio from "./components/ForgingStudio";
import ExplorerAI from "./components/ExplorerAI";
import LockScreen from "./components/LockScreen";
import AODScreen from "./components/AODScreen";
import PrivacyVault from "./components/PrivacyVault";
import { CpuWidget, SystemLogWidget, WeatherWidget } from "./components/MicroWidgets";
import { SplitSidebar, RadarSidebar } from "./components/Sidebars";
import { AnimatePresence, motion } from "motion/react";
import { 
  Wifi, Bluetooth, ShieldAlert, Cpu, Sparkles, Sliders, Battery, 
  BatteryCharging, AlertTriangle, Moon, Anchor
} from "lucide-react";

export const INITIAL_APPS: AppItem[] = [
  { id: "gemichat", name: "GemiChat", icon: "MessageCircle", category: "system", dominantColor: "#0ea5e9", baseMaterial: "glass", pulseType: "pulsate", glowColor: "#0ea5e9", usageCount: 12, lastUsedHour: 8 },
  { id: "imageforge", name: "ImageForge", icon: "Sparkles", category: "system", dominantColor: "#8b5cf6", baseMaterial: "light", pulseType: "sparkle", glowColor: "#8b5cf6", usageCount: 9, lastUsedHour: 15 },
  { id: "voicelink", name: "VoiceLink", icon: "Radio", category: "system", dominantColor: "#10b981", baseMaterial: "organic", pulseType: "ripple", glowColor: "#10b981", usageCount: 6, lastUsedHour: 10 },
  { id: "materialforge", name: "Forging Studio", icon: "Sliders", category: "tools", dominantColor: "#f59e0b", baseMaterial: "metal", pulseType: "static", glowColor: "#f59e0b", usageCount: 15, lastUsedHour: 12 },
  { id: "cortex", name: "Cortex Monitor", icon: "Cpu", category: "tools", dominantColor: "#ef4444", baseMaterial: "metal", pulseType: "pulsate", glowColor: "#ef4444", usageCount: 14, lastUsedHour: 18 },
  { id: "vault", name: "Privacy Vault", icon: "Lock", category: "system", dominantColor: "#f59e0b", baseMaterial: "metal", pulseType: "static", glowColor: "#f59e0b", usageCount: 2, lastUsedHour: 22 },
  { id: "spotify", name: "Spotify Cyber", icon: "Compass", category: "media", dominantColor: "#10b981", baseMaterial: "glass", pulseType: "spin", glowColor: "#10b981", usageCount: 8, lastUsedHour: 20 },
  { id: "chrome", name: "Chrome Gemi", icon: "Compass", category: "tools", dominantColor: "#3b82f6", baseMaterial: "glass", pulseType: "ripple", glowColor: "#3b82f6", usageCount: 5, lastUsedHour: 14 },
  { id: "settings", name: "Settings", icon: "Settings", category: "system", dominantColor: "#71717a", baseMaterial: "stone", pulseType: "static", glowColor: "#71717a", usageCount: 11, lastUsedHour: 11 },
  { id: "solitaire", name: "Solitaire OS", icon: "Play", category: "games", dominantColor: "#ec4899", baseMaterial: "glass", pulseType: "pulsate", glowColor: "#ec4899", usageCount: 3, lastUsedHour: 21 },
  { id: "console", name: "Terminal CMD", icon: "Terminal", category: "tools", dominantColor: "#22c55e", baseMaterial: "particle", pulseType: "ripple", glowColor: "#22c55e", usageCount: 10, lastUsedHour: 23 },
  { id: "whatsapp", name: "WhatsApp Synth", icon: "MessageCircle", category: "social", dominantColor: "#10b981", baseMaterial: "glass", pulseType: "pulsate", glowColor: "#10b981", usageCount: 7, lastUsedHour: 9 },
  { id: "files", name: "Leithy Files", icon: "Sliders", category: "tools", dominantColor: "#eab308", baseMaterial: "glass", pulseType: "static", glowColor: "#eab308", usageCount: 6, lastUsedHour: 13 },
  { id: "maps", name: "Maps Cosmic", icon: "Compass", category: "media", dominantColor: "#06b6d4", baseMaterial: "glass", pulseType: "ripple", glowColor: "#06b6d4", usageCount: 4, lastUsedHour: 16 },
  { id: "sublime", name: "Sublime Leith", icon: "Terminal", category: "tools", dominantColor: "#f97316", baseMaterial: "metal", pulseType: "static", glowColor: "#f97316", usageCount: 13, lastUsedHour: 19 },
  { id: "about", name: "About OS", icon: "HelpCircle", category: "system", dominantColor: "#a855f7", baseMaterial: "glass", pulseType: "pulsate", glowColor: "#a855f7", usageCount: 12, lastUsedHour: 17 }
];

export default function App() {
  const [telemetry, setTelemetry] = useState<Telemetry>({
    cpuTemp: 48,
    cpuLoad: 24,
    fps: 60,
    ramUsage: 45,
    batteryLevel: 82,
    isCharging: true,
    touchPressure: 0.15,
    ambientLight: 120
  });

  const [config, setConfig] = useState<OSConfig>({
    mode: "aod", // Start in AOD mode by default per OS design flow
    isDnd: false,
    frameRateTarget: "60",
    boostAudio: false,
    savePower: false,
    systemBreathInterval: 4000
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Sidebar & Overlay Toggles
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isWarriorPanelOpen, setIsWarriorPanelOpen] = useState(false);
  const [isSplitSidebarOpen, setIsSplitSidebarOpen] = useState(false);
  const [isRecentSidebarOpen, setIsRecentSidebarOpen] = useState(false);

  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [recentAppIds, setRecentAppIds] = useState<string[]>(["gemichat", "imageforge", "voicelink"]);
  const [activeApp, setActiveApp] = useState<AppItem | null>(null);
  const [splitApps, setSplitApps] = useState<AppItem[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fpsInterval = setInterval(() => {
      const target = Number(config.frameRateTarget);
      const fluctuation = (Math.random() - 0.5) * 4;
      const thermalThrottle = telemetry.cpuTemp > 85 ? 15 : 0;
      const baseFps = config.mode === "aod" ? 1 : config.mode === "lock" ? 30 : target;
      
      setTelemetry((prev) => ({
        ...prev,
        fps: Math.round(baseFps + (config.mode === "normal" ? fluctuation : 0) - thermalThrottle)
      }));
    }, 1000);
    return () => clearInterval(fpsInterval);
  }, [config.frameRateTarget, telemetry.cpuTemp, config.mode]);

  const updateTelemetry = (updates: Partial<Telemetry>) => setTelemetry((prev) => ({ ...prev, ...updates }));
  const updateConfig = (updates: Partial<OSConfig>) => setConfig((prev) => ({ ...prev, ...updates }));

  const handleLaunchApp = (app: AppItem) => {
    setActiveApp(app);
    setRecentAppIds((prev) => {
      const filtered = prev.filter((id) => id !== app.id);
      return [app.id, ...filtered].slice(0, 7);
    });
    setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, usageCount: a.usageCount + 1, lastUsedHour: new Date().getHours() } : a)));
  };

  const handleModifyApp = (appId: string, updates: Partial<AppItem>) => {
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, ...updates } : a)));
  };

  const getPredictedApps = (): AppItem[] => {
    const currentHour = currentTime.getHours();
    return apps
      .map((a) => {
        let score = a.usageCount;
        const hourDiff = Math.abs(a.lastUsedHour - currentHour);
        score += (24 - hourDiff) * 0.5;
        if (telemetry.cpuTemp > 75 && a.id === "cortex") score += 30;
        return { app: a, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.app);
  };

  const isWarrior = config.mode === "warrior";
  const isThermalStress = telemetry.cpuTemp > 80;

  const handleGlobalPointerDown = (e: React.PointerEvent) => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1000);

    // Only dispatch if clicking empty space or not blocked by a heavy modal.
    // In our case we can dispatch globally to keep it simple.
    window.dispatchEvent(
      new CustomEvent("cosmic-ripple", {
        detail: { x: e.clientX, y: e.clientY },
      })
    );
  };

  return (
    <div 
      id="home-layout" 
      onPointerDown={handleGlobalPointerDown}
      className={`relative w-full h-screen overflow-hidden bg-black text-stone-100 flex font-mono select-none ${isThermalStress ? 'thermal-stress' : ''}`}
    >
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="pointer-events-none absolute border-2 border-cyan-400 rounded-full animate-cosmic-ripple z-50"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}

      <AnimatePresence>
        {isThermalStress && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="absolute top-4 right-4 z-50 bg-red-950/80 border border-red-500 p-4 rounded-xl shadow-lg shadow-red-500/20 backdrop-blur-md pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500 h-6 w-6 animate-pulse" />
              <div>
                <h3 className="text-red-400 font-bold text-sm">Thermal Stress Detected</h3>
                <p className="text-red-300 text-xs mt-1">CPU Temperature: {telemetry.cpuTemp}°C</p>
              </div>
            </div>
            <button
              onClick={() => {
                updateTelemetry({ cpuTemp: 45, cpuLoad: 30 });
                updateConfig({ mode: "normal", frameRateTarget: "60", systemBreathInterval: 4000 });
              }}
              className="mt-3 w-full bg-red-600/20 hover:bg-red-500 hover:text-stone-900 border border-red-500/50 text-red-400 text-xs font-bold py-1.5 rounded transition cursor-pointer"
            >
              INITIATE ENGINE COOLING
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CortexBackground telemetry={telemetry} config={config} />

      <AnimatePresence mode="wait">
        {config.mode === "aod" ? (
          <motion.div 
            key="aod"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="absolute inset-0 z-30"
          >
            <AODScreen telemetry={telemetry} currentTime={currentTime} onWake={() => updateConfig({ mode: "lock" })} />
          </motion.div>
        ) : config.mode === "lock" ? (
          <motion.div
            key="lock"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1, transition: { duration: 0.5 } }}
            className="absolute inset-0 z-20"
          >
            <LockScreen telemetry={telemetry} config={config} currentTime={currentTime} onUnlock={() => updateConfig({ mode: "normal" })} />
          </motion.div>
        ) : (
          <motion.div
            key="normal"
            initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
          {/* Edge Handlers */}
          <div 
            onClick={() => setIsSplitSidebarOpen(true)}
            className="fixed left-0 top-0 bottom-0 w-2.5 bg-cyan-500/10 hover:bg-cyan-500/30 transition cursor-pointer z-40 flex items-center justify-center text-4xs text-cyan-400 font-bold"
            title="Open Multi-task helper"
          >
            <span className="rotate-270 whitespace-nowrap tracking-widest uppercase">SPLIT</span>
          </div>
          <div 
            onClick={() => setIsRecentSidebarOpen(true)}
            className="fixed right-0 top-0 bottom-0 w-2.5 bg-purple-500/10 hover:bg-purple-500/30 transition cursor-pointer z-40 flex items-center justify-center text-4xs text-purple-400 font-bold"
            title="Predictive App Hub"
          >
            <span className="rotate-90 whitespace-nowrap tracking-widest uppercase">RADAR</span>
          </div>

          {/* Top Panel HUD */}
          <div className="absolute top-0 left-0 right-0 h-14 border-b border-stone-800/60 bg-stone-950/40 p-4 flex justify-between items-center z-40 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center gap-6">
              <button onClick={() => updateConfig({ mode: "lock" })} className="p-1 -ml-2 rounded-full hover:bg-stone-800 transition text-stone-500 hover:text-stone-300">
                 <Moon className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Anchor className={`h-5 w-5 ${isWarrior ? "text-red-500 animate-pulse" : "text-cyan-400"}`} />
                <div>
                  <span className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">GemiLeith OS</span>
                  <span className="text-[10px] text-stone-500 ml-1.5 font-bold tracking-widest uppercase">v2•0</span>
                </div>
              </div>
              {telemetry.cpuTemp > 80 && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-500/30 rounded-full text-5xs text-red-400 font-bold tracking-widest uppercase animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5" /> Thermal throttling active
                </div>
              )}
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right hidden md:block">
                <span className="text-4xs text-stone-500 tracking-wider block">FRAME OUTPUT</span>
                <span className={`text-2xs font-extrabold ${isWarrior ? "text-red-500" : "text-cyan-400"}`}>{telemetry.fps} FPS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-4xs text-stone-500 tracking-wider block">BATTERY SYSTEM</span>
                  <span className="text-2xs font-bold text-stone-300">{telemetry.batteryLevel}%</span>
                </div>
                <div className="relative w-11 h-6 border border-stone-700 rounded p-0.5 bg-stone-950 flex items-center">
                  <div className="h-full bg-emerald-500 rounded-2xs transition-all duration-500" style={{ width: `${telemetry.batteryLevel}%` }} />
                  {telemetry.isCharging && <BatteryCharging className="absolute inset-0 h-4 w-4 m-auto text-stone-950 stroke-[3px]" />}
                </div>
              </div>
              <button
                onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}
                className="px-3.5 py-1.5 bg-stone-900/60 hover:bg-stone-800 border border-stone-800 rounded-xl text-3xs font-extrabold tracking-wider uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Sliders className="h-3 w-3" /> Quick Setup
              </button>
            </div>
          </div>

          {isQuickSettingsOpen && (
            <div id="quick-panel" className="absolute top-14 left-0 right-0 bg-stone-950/95 border-b border-stone-800 p-6 z-40 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl pointer-events-auto">
              <div className="space-y-4">
                <span className="block text-4xs text-stone-500 uppercase tracking-widest font-extrabold pb-1 border-b border-stone-900">Sensor Antennas Status</span>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-left flex items-center gap-2 text-3xs font-bold shadow-inner">
                    <Wifi className="h-4 w-4 text-cyan-400" /> WiFi: Transmitting
                  </button>
                  <button className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl text-left flex items-center gap-2 text-3xs text-stone-400">
                    <Bluetooth className="h-4 w-4" /> Blue: Connected
                  </button>
                  <button onClick={() => updateTelemetry({ isCharging: !telemetry.isCharging })} className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl text-left flex items-center gap-2 text-3xs text-stone-400 cursor-pointer hover:bg-stone-800 transition">
                    <Battery className="h-4 w-4" /> {telemetry.isCharging ? "Charge: ACTIVE" : "Charge: OFF"}
                  </button>
                  <button onClick={() => updateConfig({ isDnd: !config.isDnd })} className={`p-3 rounded-xl text-left flex items-center gap-2 text-3xs font-bold transition cursor-pointer ${config.isDnd ? "bg-amber-950/20 border-amber-500/45 text-amber-500" : "bg-stone-900/60 border-stone-800 text-stone-400"}`}>
                    <Moon className="h-4 w-4" /> Quiet Veil: {config.isDnd ? "ON" : "OFF"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-4xs text-stone-500 uppercase tracking-widest font-extrabold pb-1 border-b border-stone-900">Adaptive Cortex Alerts</span>
                <div className="space-y-2 text-4xs text-stone-300">
                  <div className="p-2.5 bg-stone-900/40 border border-stone-850 rounded-xl flex gap-2 items-start">
                    <ShieldAlert className="h-4 w-4 text-cyan-500 shrink-0" />
                    <div>
                      <span className="block font-bold">UTC Synchronization Completed</span>
                      <p className="text-5xs text-stone-500 leading-relaxed mt-0.5">Time matrix locked safely.</p>
                    </div>
                  </div>
                  {telemetry.cpuTemp > 75 && (
                    <div className="p-2.5 bg-red-950/20 border border-red-500/20 rounded-xl flex gap-2 items-start animate-pulse">
                      <Cpu className="h-4 w-4 text-red-500 shrink-0" />
                      <div>
                        <span className="block font-bold">SOC Thermal Warning Threshold</span>
                        <p className="text-5xs text-stone-500 leading-relaxed mt-0.5">GemiLeith thermal core throttled.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-black font-mono tracking-wider block text-stone-100">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-5xs text-stone-500 tracking-widest font-extrabold uppercase mt-1 block">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <button onClick={() => { setIsWarriorPanelOpen(true); setIsQuickSettingsOpen(false); }} className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-stone-950 text-3xs tracking-wider uppercase font-extrabold rounded-xl transition shadow-lg shadow-red-500/20 cursor-pointer">
                    Cortex Overclock Panel
                  </button>
                </div>
                <div className="text-5xs text-stone-500 text-right leading-tight">Developed by Ahmed Al-Leithy • GemiLeith OS v2.00 Core</div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-visible z-10 w-full max-w-5xl mx-auto pt-20 pb-16">
            {activeApp ? (
              <div className="w-full max-w-3xl bg-stone-950 border border-stone-850 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in justify-between">
                <div className="px-4 py-3 border-b border-stone-800 bg-stone-900/20 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="font-bold tracking-wide text-stone-200">{activeApp.name.toUpperCase()} SYSTEM CONTAINER</span>
                  </div>
                  <button onClick={() => setActiveApp(null)} className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 rounded text-3xs text-stone-400 hover:text-stone-200 transition font-bold cursor-pointer">
                    Terminate Container
                  </button>
                </div>
                <div className="p-5 overflow-y-auto min-h-[550px]">
                  {activeApp.id === "gemichat" || activeApp.id === "imageforge" || activeApp.id === "voicelink" ? (
                    <ExplorerAI telemetry={telemetry} />
                  ) : activeApp.id === "materialforge" ? (
                    <ForgingStudio apps={apps} telemetry={telemetry} onModifyApp={handleModifyApp} />
                  ) : activeApp.id === "vault" ? (
                    <PrivacyVault />
                  ) : activeApp.id === "cortex" ? (
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-bold text-stone-200">SYSTEM TELEMETRY EXPANSION</h3>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-stone-900/60 rounded-xl p-4 border border-stone-800">
                          <span className="block text-4xs text-stone-500 mb-1">CPU INTEL TEMP</span>
                          <span className="text-lg font-black text-stone-200">{telemetry.cpuTemp}°C</span>
                        </div>
                        <div className="bg-stone-900/60 rounded-xl p-4 border border-stone-800">
                          <span className="block text-4xs text-stone-500 mb-1">ACTIVE FPS CAP</span>
                          <span className="text-lg font-black text-stone-200">{telemetry.fps} Hz</span>
                        </div>
                      </div>
                      <button onClick={() => { setIsWarriorPanelOpen(true); setActiveApp(null); }} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-bold uppercase rounded-xl tracking-widest text-xs transition cursor-pointer">
                        Load Telemetry Simulator
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-3">
                      <Sparkles className="h-12 w-12 text-cyan-400/20 mx-auto animate-bounce" />
                      <h4 className="text-sm font-bold text-stone-100 uppercase">{activeApp.name} Loaded!</h4>
                      <p className="text-2xs text-stone-400 max-w-sm mx-auto leading-relaxed font-sans">
                        This cyber application is currently simulated underneath the GemiLeith v2.0 neural network.
                      </p>
                      <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-850 text-left font-mono text-[10px] space-y-1 mx-auto max-w-[200px]">
                        <span className="block text-stone-500">Container Status: ACTIVE</span>
                        <span className="block text-stone-500">Resource Leak check: PASS</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full h-full relative pointer-events-none">
                {/* Advanced MicroWidget Grid Layer */}
                <div className="w-full max-w-5xl z-20 pointer-events-auto mt-4 px-8 hidden md:grid grid-cols-3 gap-6 h-36">
                  <CpuWidget telemetry={telemetry} />
                  <SystemLogWidget telemetry={telemetry} />
                  <WeatherWidget />
                </div>
                
                {/* Embedded AppDrawer taking the remaining area */}
                <div className="flex-1 w-full pointer-events-auto">
                  <AppDrawer apps={apps} predictedApps={getPredictedApps()} onLaunchApp={handleLaunchApp} />
                </div>
              </div>
            )}
          </div>

          <SplitSidebar isOpen={isSplitSidebarOpen} onClose={() => setIsSplitSidebarOpen(false)} apps={apps} splitApps={splitApps} setSplitApps={setSplitApps} recentAppIds={recentAppIds} onLaunchApp={handleLaunchApp} getPredictedApps={getPredictedApps} />
          <RadarSidebar isOpen={isRecentSidebarOpen} onClose={() => setIsRecentSidebarOpen(false)} apps={apps} recentAppIds={recentAppIds} splitApps={splitApps} setSplitApps={setSplitApps} onLaunchApp={handleLaunchApp} getPredictedApps={getPredictedApps} />

          <WarriorController telemetry={telemetry} config={config} updateTelemetry={updateTelemetry} updateConfig={updateConfig} isOpen={isWarriorPanelOpen} onClose={() => setIsWarriorPanelOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
