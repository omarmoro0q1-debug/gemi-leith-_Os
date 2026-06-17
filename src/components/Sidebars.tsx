/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppItem, Telemetry, OSConfig } from "../types";
import { Layers, Compass } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  recentAppIds: string[];
  splitApps: AppItem[];
  setSplitApps: (apps: AppItem[]) => void;
  onLaunchApp: (app: AppItem) => void;
  getPredictedApps: () => AppItem[];
}

export function SplitSidebar({ isOpen, onClose, apps, splitApps, setSplitApps }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div id="split-sidebar" className="fixed inset-y-0 left-0 w-80 bg-stone-950/95 border-r border-stone-850 pointer-events-auto z-50 flex flex-col p-5 space-y-5 shadow-2xl justify-between animate-fade-in">
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-extrabold text-cyan-400 flex items-center gap-2">
          <Layers className="h-4 w-4" /> Multi-Task Assistant
        </h3>
        <p className="text-3xs text-stone-400 leading-relaxed">
          Drag apps here to place in simulated Split-Screen or floating miniform blocks.
        </p>

        <div className="space-y-2">
          <span className="block text-4xs text-stone-500 uppercase tracking-widest font-extrabold">Splitted Layers</span>
          {splitApps.length === 0 ? (
            <div className="p-6 border border-dashed border-stone-800 rounded-xl text-center text-5xs text-stone-600 font-bold uppercase">
              Empty workspace
            </div>
          ) : (
            <div className="space-y-2">
              {splitApps.map((a) => (
                <div key={a.id} className="flex justify-between items-center bg-stone-900/40 p-2.5 rounded-xl border border-stone-850">
                  <span className="text-3xs font-bold text-stone-300">{a.name}</span>
                  <button 
                    onClick={() => setSplitApps(splitApps.filter((sa) => sa.id !== a.id))}
                    className="text-5xs text-red-500 font-bold uppercase transition hover:scale-105 cursor-pointer"
                  >
                    Release
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5 pt-2">
          <span className="block text-4xs text-stone-500 uppercase tracking-widest font-extrabold pb-0.5 border-b border-stone-900 mb-2">Available Apps</span>
          <div className="grid grid-cols-2 gap-2">
            {apps.slice(0, 8).map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  if (!splitApps.find((sa) => sa.id === a.id)) {
                    setSplitApps([...splitApps, a]);
                  }
                }}
                className="p-2 border border-stone-850 rounded-xl text-left font-mono font-bold text-5xs text-stone-300 hover:border-cyan-500/50 transition cursor-pointer"
              >
                + {a.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 bg-stone-900 rounded-xl text-3xs font-bold uppercase hover:bg-stone-800 transition cursor-pointer"
      >
        Collapse Workspace
      </button>
    </div>
  );
}

export function RadarSidebar({ isOpen, onClose, apps, recentAppIds, onLaunchApp, getPredictedApps }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div id="radar-sidebar" className="fixed inset-y-0 right-0 w-80 bg-stone-950/95 border-l border-stone-850 pointer-events-auto z-50 flex flex-col p-5 space-y-6 shadow-2xl justify-between animate-fade-in">
      <div className="space-y-6">
        <div>
          <h3 className="text-xs uppercase tracking-widest font-extrabold text-purple-400 flex items-center gap-2">
            <Compass className="h-4 w-4 animate-spin" style={{ animationDuration: "8s" }} /> Predictive Radar
          </h3>
          <p className="text-3xs text-stone-400 leading-relaxed mt-1">
            GemiLeith neural predictive cortex tracks your hour habits and thermal values to predict your next action.
          </p>
        </div>

        {/* AI Predicted Section */}
        <div className="space-y-2.5">
          <span className="block text-4xs text-stone-500 uppercase tracking-widest font-extrabold pb-1 border-b border-stone-900">
            Predicted next apps
          </span>
          <div className="space-y-2">
            {getPredictedApps().map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  onLaunchApp(a);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 bg-stone-900/40 border border-stone-850/60 rounded-xl hover:border-purple-500/50 text-left transition group cursor-pointer"
              >
                <div>
                  <span className="block text-2xs font-bold text-stone-200 group-hover:text-purple-400">{a.name}</span>
                  <span className="text-5xs text-stone-500 uppercase">Usage weight: {a.usageCount}</span>
                </div>
                <span className="text-[10px] text-purple-400 font-extrabold transition group-hover:scale-110">» LAUNCH</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recents Section */}
        <div className="space-y-3">
          <span className="block text-4xs text-stone-500 uppercase tracking-widest font-extrabold pb-1 border-b border-stone-900">
            Recently launched
          </span>
          <div className="flex gap-2 flex-wrap">
            {recentAppIds.map((id) => {
              const targetApp = apps.find((a) => a.id === id);
              if (!targetApp) return null;
              return (
                <button
                  key={id}
                  onClick={() => {
                    onLaunchApp(targetApp);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 bg-stone-950 border border-stone-800 hover:border-purple-400/50 rounded-lg text-4xs font-bold text-stone-300 truncate max-w-[85px] cursor-pointer transition"
                >
                  {targetApp.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 bg-stone-900 rounded-xl text-3xs font-bold uppercase hover:bg-stone-800 transition cursor-pointer"
      >
        Collapse Radar
      </button>
    </div>
  );
}
