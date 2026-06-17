/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AppItem, PulseType, MaterialType } from "../types";
import { Orbit, Compass, RefreshCw, Layers, Star, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AppDrawerProps {
  apps: AppItem[];
  predictedApps: AppItem[];
  onLaunchApp: (app: AppItem) => void;
}

export default function AppDrawer({ apps, predictedApps, onLaunchApp }: AppDrawerProps) {
  const [layoutMode, setLayoutMode] = useState<"galaxy" | "constellation" | "grid">("galaxy");
  const [rotationOffset, setRotationOffset] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto rotation effect of dynamic cosmic drawer
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationOffset((prev) => (prev + 0.3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Translate base material into elegant inline glassmorphic or glowing styles
  const getMaterialStyle = (material: MaterialType, dominantColor: string, pulseType: PulseType) => {
    switch (material) {
      case "glass":
        return {
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(12px) saturate(180%)",
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37)`,
        };
      case "metal":
        return {
          background: `linear-gradient(135deg, rgba(82, 82, 91, 0.25) 0%, rgba(39, 39, 42, 0.35) 100%)`,
          border: `1.5px solid ${dominantColor}55`,
          boxShadow: `inset 0 1px 3px rgba(255,255,255,0.1), 0 4px 12px ${dominantColor}22`,
        };
      case "organic":
        return {
          background: `linear-gradient(135deg, rgba(6, 78, 59, 0.2) 0%, rgba(2, 44, 34, 0.3) 100%)`,
          border: `1px solid ${dominantColor}44`,
          boxShadow: `0 0 20px rgba(16, 185, 129, 0.05)`,
          borderRadius: "16px 8px 16px 8px", // asymmetric organic leaf design
        };
      case "particle":
        return {
          background: "rgba(9, 9, 11, 0.6)",
          border: `1px dashed ${dominantColor}`,
          boxShadow: `0 0 15px ${dominantColor}33`,
        };
      case "light":
        return {
          background: `radial-gradient(circle, ${dominantColor}22 0%, rgba(24, 24, 27, 0.8) 100%)`,
          border: `1.5px solid ${dominantColor}aa`,
          boxShadow: `0 0 25px ${dominantColor}55`,
        };
      case "stone":
        return {
          background: "rgba(28, 25, 23, 0.5)",
          border: `2px solid rgba(120, 113, 108, 0.4)`,
          boxShadow: `0 10px 15px -3px rgba(0,0,0,0.4)`,
          borderRadius: "4px",
        };
      default:
        return {};
    }
  };

  // Pulse animation selector
  const getAnimationClass = (pulseType: PulseType) => {
    switch (pulseType) {
      case "spin":
        return "hover:animate-spin";
      case "pulsate":
        return "animate-[pulse_3s_infinite]";
      case "ripple":
        return "hover:scale-110 active:scale-95 duration-200 transition-all";
      case "sparkle":
        return "hover:brightness-125 hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300";
      case "static":
      default:
        return "";
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-stone-200 font-mono pointer-events-none">
      
      {/* Drawer Mode Controller Bar */}
      <div className="w-full max-w-lg mb-4 bg-stone-900/60 border border-stone-800/80 p-2.5 rounded-full flex justify-between items-center pointer-events-auto backdrop-blur-md z-30 shadow-xl">
        <div className="flex items-center gap-2 pl-3">
          <Orbit className="h-4 w-4 text-cyan-400" />
          <span className="text-2xs font-extrabold uppercase tracking-widest text-stone-300">
            COSMIC APPS SYSTEM
          </span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button
            onClick={() => setLayoutMode("galaxy")}
            className={`px-3 py-1 text-4xs uppercase tracking-widest font-extrabold rounded-full transition ${
              layoutMode === "galaxy" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30" : "text-stone-400 hover:text-stone-200 border border-transparent"
            }`}
          >
            Galaxy Axis
          </button>
          <button
            onClick={() => setLayoutMode("constellation")}
            className={`px-3 py-1 text-4xs uppercase tracking-widest font-extrabold rounded-full transition ${
              layoutMode === "constellation" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30" : "text-stone-400 hover:text-stone-200 border border-transparent"
            }`}
          >
            Constellation
          </button>
          <button
            onClick={() => setLayoutMode("grid")}
            className={`px-3 py-1 text-4xs uppercase tracking-widest font-extrabold rounded-full transition ${
              layoutMode === "grid" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30" : "text-stone-400 hover:text-stone-200 border border-transparent"
            }`}
          >
            Organic Grid
          </button>
          <div className="border-l border-stone-800 h-4 mx-1" />
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Orbital Rotation"
            className={`p-1.5 rounded-full transition ${autoRotate ? "text-cyan-400" : "text-stone-500"}`}
          >
            <RefreshCw className={`h-3 w-3 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: '4s' }} />
          </button>
        </div>
      </div>

      {/* Main Celestial Map Playground */}
      <div className="relative w-full aspect-square md:aspect-video flex items-center justify-center overflow-visible">
        
        {/* Render Galaxy layouts */}
        {layoutMode === "galaxy" && (
          <div className="relative w-full h-full max-w-xl max-h-xl flex items-center justify-center">
            
            {/* Pulsating Orbit Rings */}
            <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-stone-800/60 animate-[pulse_4s_infinite]" />
            <div className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-stone-800/40 animate-[pulse_2.5s_infinite]" />

            {/* Central massive core representing GemiLeith intelligence */}
            <div className="absolute bg-gradient-to-tr from-stone-950 via-cyan-950 to-stone-900 border border-cyan-500/30 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/10 pointer-events-auto z-20">
              <Compass className="h-6 w-6 text-cyan-400 animate-[spin_20s_linear_infinite]" />
            </div>

            {/* Galaxy Orbital placement calculation */}
            {apps.map((app, index) => {
              // Place 5 inner orbit apps, and 10 outer orbit apps
              const isInner = index < 5;
              const radius = isInner ? 110 : 180;
              const angleCount = isInner ? 5 : 10;
              const relativeIndex = isInner ? index : index - 5;
              const baseAngle = (relativeIndex * (360 / angleCount));
              const totalAngle = (baseAngle + rotationOffset) * (Math.PI / 180);

              const x = Math.cos(totalAngle) * radius;
              const y = Math.sin(totalAngle) * radius;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.5, type: "spring" }}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className="absolute pointer-events-auto z-10"
                >
                  <button
                    id={`app-${app.id}`}
                    onClick={() => onLaunchApp(app)}
                    className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    {/* Forged App Body */}
                    <div
                      style={{
                        ...getMaterialStyle(app.baseMaterial, app.dominantColor, app.pulseType),
                        boxShadow: predictedApps.find(pa => pa.id === app.id) 
                          ? `0 0 25px ${app.glowColor}aa, inset 0 0 10px ${app.glowColor}66` 
                          : getMaterialStyle(app.baseMaterial, app.dominantColor, app.pulseType).boxShadow
                      }}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110 ${getAnimationClass(
                        app.pulseType
                      )}`}
                    >
                      {/* Essence Glow */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10"
                        style={{
                          background: `radial-gradient(circle, ${app.glowColor}aa 0%, rgba(0,0,0,0) 80%)`,
                        }}
                      />
                      {/* Dummy dynamic character representation inside forged app */}
                      <span className="font-bold text-lg font-mono" style={{ color: app.dominantColor }}>
                        {app.name.charAt(0)}
                      </span>
                    </div>
                    {/* Compact Label */}
                    <span className="text-3xs tracking-widest mt-1.5 uppercase font-extrabold text-stone-400 group-hover:text-stone-100 transition truncate max-w-[65px] text-center bg-stone-950/40 px-1 py-0.5 rounded">
                      {app.name}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Render Constellation Layouts */}
        {layoutMode === "constellation" && (
          <div className="relative w-full h-full max-w-xl max-h-xl flex items-center justify-center">
            
            {/* Draw celestial connections SVG overlay behind apps */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 120 180 L 220 280 L 320 180 L 420 280 L 520 180 M 120 400 L 220 280 L 320 400 M 320 180 L 320 400"
                stroke="rgba(14, 165, 233, 0.4)"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>

            {/* Place apps in custom coordinates representing a constellation star shape */}
            {apps.map((app, index) => {
              // Math placements resembling geometric constellation nodes
              const positions = [
                { x: -180, y: -120 },
                { x: -80, y: -150 },
                { x: 30, y: -180 },
                { x: 130, y: -140 },
                { x: 210, y: -90 },
                { x: -200, y: 10 },
                { x: -90, y: -10 },
                { x: 40, y: 0 },
                { x: 140, y: 30 },
                { x: 220, y: 100 },
                { x: -160, y: 130 },
                { x: -70, y: 120 },
                { x: 50, y: 150 },
                { x: 150, y: 130 },
                { x: 230, y: -10 },
              ];
              const pos = positions[index % positions.length];

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.5, type: "spring" }}
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                  }}
                  className="absolute pointer-events-auto z-10"
                >
                  <button
                    onClick={() => onLaunchApp(app)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      style={{
                        ...getMaterialStyle(app.baseMaterial, app.dominantColor, app.pulseType),
                        boxShadow: predictedApps.find(pa => pa.id === app.id) 
                          ? `0 0 25px ${app.glowColor}aa, inset 0 0 10px ${app.glowColor}66` 
                          : getMaterialStyle(app.baseMaterial, app.dominantColor, app.pulseType).boxShadow
                      }}
                      className={`relative w-11 h-11 flex items-center justify-center rounded-full border p-2 transition-all duration-300 group-hover:scale-115 ${getAnimationClass(
                        app.pulseType
                      )}`}
                    >
                      {/* Constellation Star Sparkle dot inside */}
                      <Star className="absolute top-0 right-0 h-3 w-3 text-cyan-400 animate-pulse" />
                      <span className="font-bold text-xs" style={{ color: app.dominantColor }}>
                        {app.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-3xs tracking-wider mt-1 text-stone-500 font-mono text-center">
                      {app.name}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Render standard neat organic square grid layout */}
        {layoutMode === "grid" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.05 }}
            className="relative grid grid-cols-5 gap-6 max-w-lg p-5 bg-stone-900/10 border border-stone-800/40 rounded-3xl pointer-events-auto backdrop-blur-sm z-20"
          >
            {apps.map((app, index) => (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, duration: 0.4 }}
                key={app.id}
                onClick={() => onLaunchApp(app)}
                className="flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  style={{
                    ...getMaterialStyle(app.baseMaterial, app.dominantColor, app.pulseType),
                    boxShadow: predictedApps.find(pa => pa.id === app.id) 
                      ? `0 0 25px ${app.glowColor}aa, inset 0 0 10px ${app.glowColor}66` 
                      : getMaterialStyle(app.baseMaterial, app.dominantColor, app.pulseType).boxShadow
                  }}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${getAnimationClass(
                    app.pulseType
                  )}`}
                >
                  <span className="text-sm font-bold tracking-widest font-mono" style={{ color: app.dominantColor }}>
                    {app.name.charAt(0)}
                  </span>
                </div>
                <span className="text-3xs text-stone-400 group-hover:text-cyan-400 truncate max-w-[65px] text-center mt-2.5">
                  {app.name}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
