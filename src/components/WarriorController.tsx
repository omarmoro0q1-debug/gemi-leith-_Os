/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Telemetry, OSConfig } from "../types";
import { Zap, Shield, Flame, Battery, Cpu, Volume2, Moon, Eye, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface WarriorProps {
  telemetry: Telemetry;
  config: OSConfig;
  updateTelemetry: (data: Partial<Telemetry>) => void;
  updateConfig: (data: Partial<OSConfig>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function WarriorController({
  telemetry,
  config,
  updateTelemetry,
  updateConfig,
  isOpen,
  onClose
}: WarriorProps) {
  if (!isOpen) return null;

  const isWarrior = config.mode === "warrior";

  const getTempColor = (temp: number) => {
    if (temp > 80) return "text-red-500 shadow-red-500/50 animate-pulse";
    if (temp > 60) return "text-orange-400";
    return "text-cyan-400";
  };

  const currentThemeColor = isWarrior ? "border-red-600 shadow-red-900/30" : "border-cyan-600 shadow-cyan-900/30";

  return (
    <div id="warrior-panel" className="fixed inset-y-0 right-0 w-full max-w-md bg-stone-950/95 border-l border-stone-800 pointer-events-auto z-50 flex flex-col shadow-2xl justify-between">
      {/* Panel Terminal Header */}
      <div className={`p-4 border-b border-stone-800 flex items-center justify-between ${isWarrior ? "bg-red-950/20" : "bg-cyan-950/20"}`}>
        <div className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${isWarrior ? "text-red-500" : "text-cyan-400"}`} />
          <div>
            <h2 className="text-sm font-semibold text-stone-100 font-mono tracking-wider uppercase">
              Cortex Warrior OS Console
            </h2>
            <p className="text-2xs text-stone-500 font-mono">v2.0 // Neural Driver Connected</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-200 hover:bg-stone-900 p-1.5 rounded-md font-mono text-xs transition"
        >
          [ESC]
        </button>
      </div>

      {/* Main Stats Controls panel */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-stone-800 font-mono text-stone-300">
        
        {/* Core Toggles */}
        <div className="space-y-3">
          <h3 className="text-xs text-stone-500 uppercase tracking-widest font-bold">SYSTEM POWER PROFILE</h3>
          
          {/* Warrior Mode Activate Switch */}
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isWarrior ? "bg-red-950/20 border-red-900/50 shadow-lg shadow-red-950/50" : "bg-stone-900/40 border-stone-800"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={`h-6 w-6 ${isWarrior ? "text-red-500 animate-pulse" : "text-stone-400"}`} />
                <div>
                  <span className="block text-sm font-bold tracking-wider">WARRIOR PROFILE ENGAGED</span>
                  <span className="text-3xs text-stone-500 font-mono">Boosts CPU clocks, forces {config.frameRateTarget}Hz, engages overclock theme.</span>
                </div>
              </div>
              <button
                id="toggle-warrior-btn"
                onClick={() => {
                  updateConfig({ 
                    mode: isWarrior ? "normal" : "warrior",
                    systemBreathInterval: isWarrior ? 4000 : 1500, // breathes faster in warrior mode!
                    frameRateTarget: isWarrior ? "60" : "120"
                  });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isWarrior ? "bg-red-600" : "bg-stone-700"}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isWarrior ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Telemetry Adjustment Simulators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs text-stone-500 uppercase tracking-widest font-bold">Simulate Device Telemetry</h3>
            <AlertCircle className="h-4 w-4 text-stone-500 hover:text-stone-300 cursor-help" title="Manipulate sensors to trigger OS alerts & throttling" />
          </div>

          {/* Processor Temperature */}
          <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-400">CPU Temperature:</span>
              <span className={`font-bold ${getTempColor(telemetry.cpuTemp)}`}>{telemetry.cpuTemp}°C</span>
            </div>
            <input
              type="range"
              min="30"
              max="110"
              value={telemetry.cpuTemp}
              onChange={(e) => updateTelemetry({ cpuTemp: Number(e.target.value) })}
              className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            {telemetry.cpuTemp > 85 ? (
              <p className="text-3xs text-red-500 animate-pulse flex items-center gap-1">
                <AlertCircle className="h-3 w-3 inline" /> WARNING: SOC overheating. Critical thermal throttle active!
              </p>
            ) : null}
          </div>

          {/* CPU Clock Load */}
          <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-400">CPU Clocks Core Load:</span>
              <span className="font-bold text-stone-200">{telemetry.cpuLoad}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="100"
              value={telemetry.cpuLoad}
              onChange={(e) => updateTelemetry({ cpuLoad: Number(e.target.value) })}
              className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Total RAM Consumption */}
          <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-400">Virtual RAM Allocated:</span>
              <span className="font-bold text-stone-200">{telemetry.ramUsage}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="98"
              value={telemetry.ramUsage}
              onChange={(e) => updateTelemetry({ ramUsage: Number(e.target.value) })}
              className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Pressure interaction multiplier */}
          <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-400">Interactive Stylus Pressure:</span>
              <span className="font-bold text-stone-200">{(telemetry.touchPressure * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={Math.round(telemetry.touchPressure * 100)}
              onChange={(e) => updateTelemetry({ touchPressure: Number(e.target.value) / 100 })}
              className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Warrior System Subtoggles */}
        <div id="sub-parameters-grid" className="grid grid-cols-2 gap-3">
          
          {/* DND switch */}
          <button
            onClick={() => updateConfig({ isDnd: !config.isDnd })}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border font-mono transition text-center ${
              config.isDnd 
                ? "bg-red-950/20 border-red-500/40 text-stone-100" 
                : "bg-stone-900/50 border-stone-800 hover:border-stone-700 text-stone-400"
            }`}
          >
            <Moon className="h-5 w-5 mb-1.5" />
            <span className="text-xs font-bold leading-tight">Quiet Veil (DND)</span>
            <span className="text-3xs text-stone-500">{config.isDnd ? "ACTIVE" : "OFF"}</span>
          </button>

          {/* Target locked */}
          <button
            onClick={() => updateConfig({ frameRateTarget: config.frameRateTarget === "120" ? "60" : "120" })}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border font-mono transition text-center ${
              config.frameRateTarget === "120"
                ? "bg-amber-950/20 border-amber-500/40 text-stone-100" 
                : "bg-stone-900/50 border-stone-800 hover:border-stone-700 text-stone-400"
            }`}
          >
            <Cpu className="h-5 w-5 mb-1.5" />
            <span className="text-xs font-bold leading-tight">{config.frameRateTarget}Hz Core Mode</span>
            <span className="text-3xs text-stone-500">MAX FPS LOCK</span>
          </button>

          {/* Vapor boost audio */}
          <button
            onClick={() => updateConfig({ boostAudio: !config.boostAudio })}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border font-mono transition text-center ${
              config.boostAudio 
                ? "bg-purple-950/20 border-purple-500/40 text-stone-100" 
                : "bg-stone-900/50 border-stone-800 hover:border-stone-700 text-stone-400"
            }`}
          >
            <Volume2 className="h-5 w-5 mb-1.5" />
            <span className="text-xs font-bold leading-tight">Vapor Audio Boost</span>
            <span className="text-3xs text-stone-500">{config.boostAudio ? "ACTIVE" : "NORMAL"}</span>
          </button>

          {/* Low power */}
          <button
            onClick={() => updateConfig({ savePower: !config.savePower })}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border font-mono transition text-center ${
              config.savePower 
                ? "bg-emerald-950/20 border-emerald-500/40 text-stone-100"
                : "bg-stone-900/50 border-stone-800 hover:border-stone-700 text-stone-400"
            }`}
          >
            <Battery className="h-5 w-5 mb-1.5" />
            <span className="text-xs font-bold leading-tight">Core Throttle Power</span>
            <span className="text-3xs text-stone-500">{config.savePower ? "BATTERY SAVER" : "MAX POWER"}</span>
          </button>
        </div>
      </div>

      {/* Controller Footer Terminal */}
      <div className="p-4 border-t border-stone-800 bg-stone-900/60 flex items-center justify-between text-3xs font-mono text-stone-500">
        <span>GemiLeith OS Subsystem active.</span>
        <span>Ahmed Al-Leithy Console v2.00</span>
      </div>
    </div>
  );
}
