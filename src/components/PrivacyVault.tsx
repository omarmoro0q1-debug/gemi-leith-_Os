/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Lock, FileKey, ShieldAlert, Fingerprint } from "lucide-react";

export default function PrivacyVault() {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [errorWait, setErrorWait] = useState(false);

  const handleDigit = (digit: number) => {
    if (errorWait) return;
    const next = passcode + digit.toString();
    setPasscode(next);

    if (next.length === 4) {
      if (next === "0000") {
        setUnlocked(true);
      } else {
        setErrorWait(true);
        setTimeout(() => {
          setPasscode("");
          setErrorWait(false);
        }, 1000);
      }
    }
  };

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full bg-stone-950">
        <ShieldAlert className={`h-16 w-16 mb-4 ${errorWait ? "text-red-500 animate-pulse" : "text-amber-500"}`} />
        <h2 className="text-xl font-bold font-mono tracking-widest text-stone-200">PRIVACY VAULT</h2>
        <p className="text-xs text-stone-500 mb-8 font-mono">ENCRYPTED PARTITION LOCKED</p>

        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border transition-all ${
                i < passcode.length 
                  ? errorWait 
                    ? "bg-red-500 border-red-500" 
                    : "bg-cyan-500 border-cyan-500" 
                  : "border-stone-700 bg-transparent"
              }`} 
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-xl font-bold text-stone-300 hover:bg-stone-800 hover:text-cyan-400 transition"
            >
              {num}
            </button>
          ))}
          <div className="w-16 h-16" />
          <button
            onClick={() => handleDigit(0)}
            className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-xl font-bold text-stone-300 hover:bg-stone-800 hover:text-cyan-400 transition"
          >
            0
          </button>
          <button
            onClick={() => {
              if (!errorWait && passcode.length > 0) {
                setPasscode(passcode.slice(0, -1));
              }
            }}
            className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-xs font-bold text-stone-500 hover:bg-stone-800 hover:text-red-400 transition"
          >
            DEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-950 p-6">
      <div className="flex justify-between items-center mb-6 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-widest text-emerald-400 flex items-center gap-2">
            <Lock className="h-5 w-5" /> VAULT OPEN
          </h2>
          <span className="text-3xs text-stone-500 font-mono tracking-widest uppercase">AES-256 Quantum Decrypted</span>
        </div>
        <button onClick={() => { setUnlocked(false); setPasscode(""); }} className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-3xs font-extrabold text-stone-300 hover:text-red-400 transition cursor-pointer">
          SECURE & LOCK
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Credentials.key", size: "2 KB" },
          { label: "NeuralBackup_09.dat", size: "84 MB" },
          { label: "Private_Photos", size: "1.2 GB" },
          { label: "Wallet_Seed.txt", size: "1 KB" }
        ].map((file, i) => (
          <div key={i} className="p-4 bg-stone-900/40 border border-stone-800 rounded-xl hover:border-cyan-500/50 cursor-pointer transition flex flex-col items-center justify-center aspect-square gap-3 group">
            <FileKey className="h-8 w-8 text-stone-600 group-hover:text-cyan-400 transition" />
            <div className="text-center">
              <span className="block text-[10px] font-bold text-stone-300 truncate max-w-[100px]">{file.label}</span>
              <span className="text-5xs text-stone-500">{file.size}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
