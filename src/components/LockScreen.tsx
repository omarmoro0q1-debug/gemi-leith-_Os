/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Telemetry, OSConfig } from "../types";
import { Lock, Fingerprint, Sparkles } from "lucide-react";

interface LockScreenProps {
  telemetry: Telemetry;
  config: OSConfig;
  currentTime: Date;
  onUnlock: () => void;
}

export default function LockScreen({ telemetry, config, currentTime, onUnlock }: LockScreenProps) {
  // A dark, expectant state awaiting human interaction.
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between py-24 select-none animate-fade-in backdrop-blur-sm bg-stone-950/20">
      <div className="flex flex-col items-center space-y-4">
        <Lock className="h-6 w-6 text-stone-500 mb-2 opacity-50" />
        <span className="text-7xl font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-stone-100 to-stone-600">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">
          {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="flex flex-col items-center space-y-8">
        {/* Simulating pending micro-widgets on lock screen */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-stone-900/60 border border-stone-800 rounded-full px-4 py-2 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-4xs uppercase tracking-widest font-bold text-stone-300">Cortex Idle</span>
          </div>
        </div>

        {/* The organic biometric trigger */}
        <button 
          onClick={onUnlock}
          className="relative group p-6 rounded-full flex items-center justify-center cursor-crosshair transition-all duration-500 hover:scale-110"
        >
          <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/30 transition-all duration-300" />
          <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-[spin_8s_linear_infinite]" />
          <Fingerprint className="h-10 w-10 text-cyan-400 group-hover:text-cyan-300 relative z-10 transition-colors" />
        </button>
        <span className="text-4xs text-stone-500 tracking-widest uppercase animate-pulse">Bio-Metric Link</span>
      </div>
    </div>
  );
}
