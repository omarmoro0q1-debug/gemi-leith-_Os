/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Telemetry, OSConfig } from "../types";
import { Cpu, Terminal, CloudSun } from "lucide-react";

export function CpuWidget({ telemetry }: { telemetry: Telemetry }) {
  return (
    <div className="flex flex-col justify-between bg-stone-900/60 border border-stone-800 rounded-2xl p-4 w-full h-full relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 z-10">
        <span className="text-3xs uppercase tracking-widest text-stone-500 font-bold">Core Cortex</span>
        <Cpu className={`h-4 w-4 ${telemetry.cpuTemp > 75 ? "text-red-500 animate-pulse" : "text-cyan-400"}`} />
      </div>
      <div className="z-10">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-black text-stone-200 leading-none">{telemetry.cpuTemp}</span>
          <span className="text-xs text-stone-500 mb-1">°C</span>
        </div>
        <div className="mt-2 w-full h-1 bg-stone-950 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${telemetry.cpuTemp > 75 ? 'bg-red-500' : 'bg-cyan-500'}`} 
            style={{ width: `${(telemetry.cpuTemp / 100) * 100}%` }} 
          />
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-5">
        <Cpu className="h-24 w-24 text-stone-100" />
      </div>
    </div>
  );
}

export function SystemLogWidget({ telemetry }: { telemetry: Telemetry }) {
  return (
    <div className="flex flex-col bg-stone-900/60 border border-stone-800 rounded-2xl p-4 w-full h-full backdrop-blur-md font-mono">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="h-3 w-3 text-emerald-400" />
        <span className="text-3xs uppercase tracking-widest text-emerald-500 font-bold">Neural Log</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col justify-end text-[8px] text-stone-500 space-y-1">
        <div className="flex gap-2">
          <span className="text-stone-700">12:44:02</span>
          <span>INIT_BIO_SYNC_ROUTINE : [OK]</span>
        </div>
        <div className="flex gap-2">
          <span className="text-stone-700">12:44:03</span>
          <span>FPS_LOCK_TARGET : {telemetry.fps}</span>
        </div>
        <div className="flex gap-2">
           <span className="text-stone-700">12:44:05</span>
           <span>RAM_CAP_USAGE : {telemetry.ramUsage}%</span>
        </div>
        <div className="flex gap-2">
          <span className="text-stone-700">12:44:07</span>
          <span className={telemetry.cpuTemp > 75 ? "text-red-400 animate-pulse" : "text-emerald-400"}>
            THERMAL_STATE_READ : {telemetry.cpuTemp}°C
          </span>
        </div>
      </div>
    </div>
  );
}

export function WeatherWidget() {
  return (
    <div className="flex flex-col justify-between bg-gradient-to-br from-cyan-950/40 to-blue-900/20 border border-stone-800 rounded-2xl p-4 w-full h-full backdrop-blur-md hidden sm:flex">
      <div className="flex items-start justify-between">
        <div>
          <span className="block text-3xl font-black text-stone-200">22°</span>
          <span className="text-3xs uppercase tracking-widest text-stone-400">Clear Skies</span>
        </div>
        <CloudSun className="h-6 w-6 text-yellow-500" />
      </div>
      <div className="text-[9px] text-stone-500 mt-2 font-mono uppercase tracking-widest">
        Cairo • Sector 4
      </div>
    </div>
  );
}
