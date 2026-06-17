/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { AppItem, PulseType, MaterialType, Telemetry } from "../types";
import { Hexagon, Layers, Paintbrush, Play, Check, Sun, CloudRain, Cpu, BatteryCharging } from "lucide-react";

interface ForgingProps {
  apps: AppItem[];
  telemetry: Telemetry;
  onModifyApp: (appId: string, updates: Partial<AppItem>) => void;
}

export default function ForgingStudio({ apps, telemetry, onModifyApp }: ForgingProps) {
  const [selectedAppId, setSelectedAppId] = useState<string>(apps[0]?.id || "");
  const selectedApp = apps.find((a) => a.id === selectedAppId);

  // Forging states
  const [dominantColor, setDominantColor] = useState("#0ea5e9");
  const [baseMaterial, setBaseMaterial] = useState<MaterialType>("glass");
  const [pulseType, setPulseType] = useState<PulseType>("pulsate");

  // Sync state with selected app
  useEffect(() => {
    if (selectedApp) {
      setDominantColor(selectedApp.dominantColor);
      setBaseMaterial(selectedApp.baseMaterial);
      setPulseType(selectedApp.pulseType);
    }
  }, [selectedAppId]);

  const handleApplyForging = () => {
    if (!selectedAppId) return;
    onModifyApp(selectedAppId, {
      dominantColor,
      baseMaterial,
      pulseType,
      glowColor: dominantColor,
    });
  };

  const colors = [
    { name: "Cosmic Blue", hex: "#0ea5e9" },
    { name: "Cyber Crimson", hex: "#ef4444" },
    { name: "Acid Lime", hex: "#84cc16" },
    { name: "Shattered Amber", hex: "#f59e0b" },
    { name: "Neon Violet", hex: "#8b5cf6" },
    { name: "Solar Orange", hex: "#f97316" },
  ];

  const materials: { type: MaterialType; label: string; desc: string }[] = [
    { type: "glass", label: "Neural Glass", desc: "Glossy glassmorphism with high light transmission" },
    { type: "metal", label: "Saber Chrome", desc: "Brushed alloy with metallic outlines" },
    { type: "organic", label: "Bio-Leaf", desc: "Asymmetric vegetative bio-organic matter" },
    { type: "particle", label: "Dust Mesh", desc: "Dotted atomic particle grids" },
    { type: "light", label: "Hyper-Glow", desc: "Immersive neon radial light core" },
    { type: "stone", label: "Monolith Slate", desc: "Chiseled basalt slab with stone outlines" },
  ];

  const pulses: { type: PulseType; label: string }[] = [
    { type: "pulsate", label: "Neural Breathing" },
    { type: "spin", label: "Orbital Axis Spin" },
    { type: "ripple", label: "Hydro Ripple" },
    { type: "sparkle", label: "Star Sparkle" },
    { type: "static", label: "Absolute Lock" },
  ];

  return (
    <div className="space-y-6 text-stone-200 p-1 select-none font-mono">
      <div className="flex gap-2 items-center mb-1">
        <Paintbrush className="h-5 w-5 text-cyan-400" />
        <h2 className="text-sm font-bold tracking-widest uppercase">GemiLeith Material forging studio</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-stone-900/40 border border-stone-800/80 rounded-2xl backdrop-blur-sm z-30">
        
        {/* LEFT COLUMN: Controls panel */}
        <div className="space-y-5">
          {/* App Selector */}
          <div className="space-y-2">
            <label className="text-2xs text-stone-500 uppercase tracking-widest font-bold">SELECT ICON TARGET</label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 outline-none focus:border-cyan-500"
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} [{app.category.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          {/* Color Forger */}
          <div className="space-y-2">
            <span className="block text-2xs text-stone-500 uppercase tracking-widest font-bold">SPECTRUM SELECTION</span>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setDominantColor(c.hex)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition border-2 ${
                    dominantColor === c.hex ? "border-stone-100 scale-110" : "border-stone-900 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {dominantColor === c.hex && <Check className="h-3 w-3 text-stone-950 stroke-[3px]" />}
                </button>
              ))}
              <input
                type="color"
                value={dominantColor}
                onChange={(e) => setDominantColor(e.target.value)}
                className="w-7 h-7 bg-transparent border-0 cursor-pointer outline-none"
                title="Custom hex color"
              />
            </div>
          </div>

          {/* Material Forger */}
          <div className="space-y-2">
            <span className="block text-2xs text-stone-500 uppercase tracking-widest font-bold">MATERIAL CONSTITUTION</span>
            <div className="grid grid-cols-2 gap-2">
              {materials.map((m) => (
                <button
                  key={m.type}
                  onClick={() => setBaseMaterial(m.type)}
                  className={`p-2.5 rounded-xl text-left border text-4xs transition duration-200 ${
                    baseMaterial === m.type
                      ? "bg-cyan-950/20 border-cyan-500 text-stone-100"
                      : "bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-400"
                  }`}
                >
                  <span className="block font-bold mb-0.5">{m.label}</span>
                  <span className="text-5xs block text-stone-500 leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pulse Interactions */}
          <div className="space-y-2">
            <span className="block text-2xs text-stone-500 uppercase tracking-widest font-bold">TACTILE KINETICS</span>
            <div className="flex gap-1.5 flex-wrap">
              {pulses.map((p) => (
                <button
                  key={p.type}
                  onClick={() => setPulseType(p.type)}
                  className={`px-3 py-1.5 rounded-lg border text-4xs transition ${
                    pulseType === p.type
                      ? "bg-purple-950/20 border-purple-500 text-stone-100"
                      : "bg-stone-950/50 border-stone-800 hover:border-stone-700 text-stone-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Commit Button */}
          <button
            onClick={handleApplyForging}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-stone-950 font-extrabold text-xs tracking-widest uppercase py-3 rounded-xl transition shadow-lg shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-current stroke-[3px]" /> Force Alloy Fusion
          </button>
        </div>

        {/* RIGHT COLUMN: Holographic Preview */}
        <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 flex flex-col items-center justify-center space-y-4 relative overflow-hidden min-h-[280px]">
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-4xs text-stone-500 tracking-widest font-bold uppercase">HOLOPREVIEW STAGE</span>
          </div>

          {/* Simulated Forged App Icon Render inside Stage */}
          <div className="relative group p-6 flex flex-col items-center">
            
            {/* The Essence glow projection shadow */}
            <div
              className="absolute inset-0 rounded-3xl opacity-80 blur-xl transition"
              style={{
                background: `radial-gradient(circle, ${dominantColor}cc 0%, rgba(0,0,0,0) 70%)`,
                transform: "scale(1.2)",
              }}
            />

            {/* Simulated materials body rendering */}
            <div
              className={`w-28 h-28 flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                baseMaterial === "organic" ? "rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg" : 
                baseMaterial === "stone" ? "rounded-none" : "rounded-[2rem]"
              } ${
                pulseType === "spin" ? "animate-[spin_10s_linear_infinite]" :
                pulseType === "pulsate" ? "animate-pulse" :
                pulseType === "sparkle" ? "hover:brightness-125 scale-105" : ""
              }`}
              style={{
                background:
                  baseMaterial === "glass" ? "rgba(255, 255, 255, 0.05)" :
                  baseMaterial === "metal" ? "linear-gradient(135deg, rgba(82,82,82,0.4) 0%, rgba(30,30,30,0.5) 100%)" :
                  baseMaterial === "organic" ? "rgba(4, 120, 87, 0.25)" :
                  baseMaterial === "particle" ? "rgba(0,0,0,0.8)" :
                  baseMaterial === "light" ? `radial-gradient(circle, ${dominantColor}33 0%, rgba(0,0,0,0.9) 100%)` :
                  "rgba(30, 27, 24, 0.8)",
                border:
                  baseMaterial === "particle" ? `1.5px dashed ${dominantColor}` :
                  `1.5px solid ${dominantColor}`,
                boxShadow: `0 15px 35px ${dominantColor}33`,
              }}
            >
              <span className="text-4xl font-extrabold" style={{ color: dominantColor }}>
                {selectedApp?.name?.charAt(0) || "G"}
              </span>
            </div>
            
            <span className="text-2xs font-extrabold tracking-widest text-stone-400 mt-4 uppercase">
              {selectedApp?.name || "Target App"}
            </span>
          </div>

          {/* Widget Demo Section */}
          <div className="w-full mt-6 border-t border-stone-800 pt-4 flex flex-col space-y-3 font-mono text-stone-400">
            <span className="text-5xs text-stone-500 uppercase tracking-widest font-bold block">FORGED SYSTEM WIDGET RENDER</span>
            
            <div className="grid grid-cols-2 gap-2 text-stone-300">
              {/* Animated Weather Widget */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-2.5 text-center flex flex-col items-center justify-center space-y-1">
                <Sun className="h-5 w-5 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
                <span className="text-4xs font-bold font-mono">Cosmic Dusk</span>
                <span className="text-5xs text-stone-500">24°C // Wind NNE</span>
              </div>

              {/* Dynamic Fluid Battery */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-emerald-500/15 transition-all duration-500" 
                  style={{ height: `${telemetry.batteryLevel}%` }} 
                />
                <BatteryCharging className="h-5 w-5 text-emerald-400 z-10 animate-pulse" />
                <span className="text-4xs font-bold font-mono z-10">{telemetry.batteryLevel}% Fluid</span>
                <span className="text-5xs text-stone-500 z-10">{telemetry.isCharging ? "ACCUMULATING" : "DISCHARGED"}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
