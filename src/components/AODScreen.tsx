/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Telemetry, OSConfig } from "../types";
import { Moon } from "lucide-react";

interface AODScreenProps {
  telemetry: Telemetry;
  currentTime: Date;
  onWake: () => void;
}

export default function AODScreen({ telemetry, currentTime, onWake }: AODScreenProps) {
  // Always-On Display. Ultra-minimalist, high-contrast, black background.
  return (
    <div 
      onClick={onWake}
      className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center cursor-pointer animate-fade-in"
    >
      <div className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity duration-1000">
        <span className="text-5xl font-mono text-stone-400 font-extrabold tracking-widest opacity-80" style={{ textShadow: "0 0 10px rgba(168, 162, 158, 0.2)" }}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-2 mt-6">
          <Moon className="h-3 w-3 text-stone-600" />
          <span className="text-5xs font-mono tracking-widest text-stone-500 uppercase">{telemetry.batteryLevel}% fluid</span>
        </div>
      </div>
      
      {/* System breathing indicator in AOD */}
      <div className="absolute bottom-16">
        <div className="w-1.5 h-1.5 bg-stone-500 rounded-full shadow-[0_0_8px_rgba(168,162,158,0.4)] animate-[pulse_6s_infinite]" />
      </div>
    </div>
  );
}
