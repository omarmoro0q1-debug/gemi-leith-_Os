/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Mic, Play } from "lucide-react";

export default function LiveVoiceChannel() {
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [voiceSubtitles, setVoiceSubtitles] = useState("Tap starting connection to neural link voice companion...");
  const [voiceTurn, setVoiceTurn] = useState<"idle" | "listening" | "speaking">("idle");
  const [isMicMuted, setIsMicMuted] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioCtxInputRef = useRef<AudioContext | null>(null);
  const audioCtxOutputRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const pcmBytesFromFloat32 = (f32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(f32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < f32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, f32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  const playAudioChunk = async (outputCtx: AudioContext, base64PCM: string) => {
    try {
      const binary = atob(base64PCM);
      const outputBuffer = new ArrayBuffer(binary.length);
      const view = new DataView(outputBuffer);
      const bytes = new Uint8Array(outputBuffer);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const samples = binary.length / 2;
      const f32Array = new Float32Array(samples);
      for (let i = 0; i < samples; i++) {
        f32Array[i] = view.getInt16(i * 2, true) / 32768;
      }

      audioQueueRef.current.push(f32Array);
      if (!isPlayingRef.current) {
        isPlayingRef.current = true;
        playQueue(outputCtx);
      }
    } catch (err) {
      console.error("PCM Chunk execution error:", err);
    }
  };

  const playQueue = (outputCtx: AudioContext) => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setVoiceTurn("listening");
      return;
    }

    setVoiceTurn("speaking");
    const chunk = audioQueueRef.current.shift()!;
    const audioBuffer = outputCtx.createBuffer(1, chunk.length, 24000);
    audioBuffer.getChannelData(0).set(chunk);

    const source = outputCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputCtx.destination);
    source.onended = () => {
      playQueue(outputCtx);
    };
    source.start(0);
  };

  const startVoiceLink = async () => {
    try {
      setVoiceSubtitles("Establishing secure Cortex Neural gateway connection...");
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/`;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setVoiceSubtitles("Transmitting initial handshake to GemiLeith live core...");
        socket.send(JSON.stringify({ type: "init" }));
      };

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "ready") {
          setIsVoiceConnected(true);
          setVoiceTurn("listening");
          setVoiceSubtitles("Neural link authenticated. Talk to GemiLeith now!");
          
          audioCtxInputRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          audioCtxOutputRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = micStream;

          const source = audioCtxInputRef.current.createMediaStreamSource(micStream);
          const processor = audioCtxInputRef.current.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          source.connect(processor);
          processor.connect(audioCtxInputRef.current.destination);

          processor.onaudioprocess = (e) => {
            if (isMicMuted) return;
            const float32PCM = e.inputBuffer.getChannelData(0);
            const base64PCM = pcmBytesFromFloat32(float32PCM);
            
            if (socket.readyState === WebSocket.OPEN) {
              setVoiceTurn("listening");
              socket.send(JSON.stringify({ type: "audio", data: base64PCM }));
            }
          };
        }

        if (msg.type === "audio") {
          if (audioCtxOutputRef.current) {
            playAudioChunk(audioCtxOutputRef.current, msg.data);
          }
        }

        if (msg.type === "transcript") {
          setVoiceSubtitles(msg.text);
        }

        if (msg.type === "interrupted") {
          audioQueueRef.current = [];
          isPlayingRef.current = false;
          setVoiceTurn("listening");
          setVoiceSubtitles("[Interrupted by user input]");
        }

        if (msg.type === "error") {
          setVoiceSubtitles(`Cortex Link Error: ${msg.message}`);
          stopVoiceLink();
        }
      };

      socket.onclose = () => {
        stopVoiceLink();
      };

      socket.onerror = (e) => {
        console.error("Live WebSockets error:", e);
        setVoiceSubtitles("Cortex Live channel connection failed.");
        stopVoiceLink();
      };

    } catch (err: any) {
      console.error(err);
      setVoiceSubtitles(`Mic Hardware configuration error: ${err?.message || "Denied"}`);
      stopVoiceLink();
    }
  };

  const stopVoiceLink = () => {
    setIsVoiceConnected(false);
    setVoiceTurn("idle");
    setVoiceSubtitles("Tap launching neural connection to chat again.");

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (audioCtxInputRef.current) {
      audioCtxInputRef.current.close();
      audioCtxInputRef.current = null;
    }

    if (audioCtxOutputRef.current) {
      audioCtxOutputRef.current.close();
      audioCtxOutputRef.current = null;
    }

    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const toggleMicMute = () => {
    setIsMicMuted((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      stopVoiceLink();
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col p-5 items-center justify-center space-y-5 relative">
      <div className="relative flex items-center justify-center">
        {isVoiceConnected && voiceTurn === "speaking" && (
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 scale-150 blur-lg animate-ping z-0" />
        )}
        {isVoiceConnected ? (
          <div className={`z-10 w-32 h-32 rounded-full flex items-center justify-center border-4 ${
            voiceTurn === "speaking" ? "border-cyan-500 bg-cyan-950/40 animate-pulse" :
            voiceTurn === "listening" ? "border-emerald-500 bg-emerald-950/20" : "border-stone-700 bg-stone-950"
          } transition-all duration-300`}>
            <Mic className={`h-12 w-12 ${
              voiceTurn === "speaking" ? "text-cyan-400 fill-cyan-400" :
              voiceTurn === "listening" ? "text-emerald-400" : "text-stone-400"
            }`} />
          </div>
        ) : (
          <button
            onClick={startVoiceLink}
            className="z-10 w-32 h-32 rounded-full flex items-center justify-center border-4 border-dashed border-stone-800 hover:border-cyan-500/50 bg-stone-950/40 hover:bg-stone-950 transition-all duration-300 group cursor-pointer"
          >
            <Play className="h-12 w-12 text-stone-500 group-hover:text-cyan-400 group-hover:scale-110 duration-200 transition" />
          </button>
        )}
      </div>

      <div className="text-center space-y-2 z-10 w-full">
        <span className="inline-block px-3 py-1 rounded-full text-5xs tracking-widest font-extrabold uppercase bg-stone-950/80 border border-stone-850">
          {voiceTurn === "idle" ? "NEURAL NODE DISCONNECTED" :
           voiceTurn === "listening" ? "CORTEX LISTENING [16KHZ]" : "CORTEX TRANSMITTING CHUNKS [24KHZ]"}
        </span>
        <p className="text-xs font-sans text-stone-300 max-w-sm mx-auto leading-relaxed h-12 flex items-center justify-center px-4 bg-stone-950/30 border border-stone-900 rounded-xl italic">
          {voiceSubtitles}
        </p>
      </div>

      <div className="flex gap-4 z-10">
        {isVoiceConnected ? (
          <>
            <button
              onClick={toggleMicMute}
              className={`px-4 py-2 text-4xs uppercase tracking-widest font-extrabold rounded-xl border transition ${
                isMicMuted 
                  ? "bg-red-500/20 border-red-500 text-red-400" 
                  : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
            >
              {isMicMuted ? "[MUTED]" : "Mute Mic"}
            </button>
            <button
              onClick={stopVoiceLink}
              className="px-4 py-2 text-4xs bg-red-600 hover:bg-red-500 text-stone-950 font-extrabold uppercase tracking-wider rounded-xl transition"
            >
              Sever Stream Link
            </button>
          </>
        ) : (
          <button
            onClick={startVoiceLink}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-extrabold text-xs tracking-wider uppercase rounded-xl transition shadow-lg shadow-cyan-500/10 cursor-pointer"
          >
            Launch Cortex voice channel
          </button>
        )}
      </div>
    </div>
  );
}
