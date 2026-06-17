/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { ChatMessage, ForgedImage, Telemetry } from "../types";
import { MessageSquare, Image, Mic, Send, Sparkles, Loader2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import LiveVoiceChannel from "./LiveVoiceChannel";

interface AIProps {
  telemetry: Telemetry;
}

export default function ExplorerAI({ telemetry }: AIProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "imagify" | "voice">("chat");

  // Chat States
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [useThinking, setUseThinking] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Expanded thought toggles
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  // Image Gen States
  const [imagePrompt, setImagePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [forgedImages, setForgedImages] = useState<ForgedImage[]>([]);

  // Scroll chat bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLogs]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // 1. Handling ChatGPT REST Send
  const handleSendChatMessage = async () => {
    if (!userInput.trim() || isChatLoading) return;
    const userMsgText = userInput.trim();
    setUserInput("");

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatLogs((prev) => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
      // Send message along with history to server REST API
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history: chatLogs.map(l => ({ role: l.role === "user" ? "user" : "model", text: l.text })),
          useThinking,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const botMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "model",
        text: data.text || "I was unable to assemble a coherent cosmic respond. Please verify your neural transmitter link.",
        thinking: data.thinking || "",
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatLogs((prev) => [...prev, botMsg]);
      if (botMsg.thinking) {
        setExpandedThoughts((prev) => ({ ...prev, [botMsg.id]: true }));
      }
    } catch (err: any) {
      console.error(err);
      setChatLogs((prev) => [
        ...prev,
        {
          id: `m-error-${Date.now()}`,
          role: "model",
          text: `[SYSTEM ERROR] Neural transmitter feedback lost: ${err?.message || "LinkTimeout"}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Handling Image Generator Forge REST API
  const handleForgeImage = async () => {
    if (!imagePrompt.trim() || isImageLoading) return;
    const promptText = imagePrompt.trim();
    setIsImageLoading(true);

    try {
      const response = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          aspectRatio,
          isHighQuality,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newImage: ForgedImage = {
        id: `img-${Date.now()}`,
        url: data.imageUrl,
        prompt: promptText,
        timestamp: new Date().toLocaleTimeString(),
      };

      setForgedImages((prev) => [newImage, ...prev]);
      setImagePrompt("");
    } catch (err: any) {
      console.error(err);
      alert(`Image Forging Failed: ${err?.message || "System Throttled"}`);
    } finally {
      setIsImageLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-stone-900/30 border border-stone-800/80 rounded-2xl h-[550px] overflow-hidden pointer-events-auto backdrop-blur-md z-30 font-mono shadow-xl justify-between">
      
      {/* Tab Select Controller Bar */}
      <div className="flex bg-stone-950/60 border-b border-stone-800/80 p-2 justify-between items-center text-xs">
        <div className="flex gap-1.5 p-1 bg-stone-900/60 rounded-xl">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === "chat" ? "bg-cyan-500/20 text-cyan-400" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" /> GemiChat
          </button>
          <button
            onClick={() => setActiveTab("imagify")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === "imagify" ? "bg-cyan-500/20 text-cyan-400" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Image className="h-3.5 w-3.5" /> ImageGen
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === "voice" ? "bg-cyan-500/20 text-cyan-400" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Mic className="h-3.5 w-3.5" /> VoiceLive
          </button>
        </div>

        <div className="pr-3 text-4xs text-stone-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" /> Gemini Intel Integrated
        </div>
      </div>

      {/* RENDER ACTIVE TAB: 1. Chat */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col min-h-0 justify-between">
          {/* Chat scrolling log list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-stone-800 min-h-0">
            {chatLogs.length === 0 ? (
              <div className="text-center py-10 space-y-3 text-stone-500">
                <Sparkles className="h-10 w-10 text-cyan-500/20 mx-auto animate-bounce" />
                <p className="text-2xs max-w-xs mx-auto leading-relaxed">
                  Welcome to GemiChat. Select Deep Thinking Mode to activate models/gemini-3.1-pro-preview.
                </p>
              </div>
            ) : (
              chatLogs.map((msg) => (
                <div key={msg.id} className={`flex flex-col space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 text-4xs text-stone-500 uppercase tracking-widest font-bold">
                    <span>{msg.role === "user" ? "USER" : "GEMILEITH"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Deep thinking expanded card */}
                  {msg.thinking && (
                    <div className="w-full max-w-sm bg-stone-950/80 border border-stone-800 rounded-xl p-3 mb-2 space-y-2 text-stone-400">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="flex items-center justify-between w-full text-5xs tracking-widest text-amber-500 uppercase font-extrabold"
                      >
                        <span className="flex items-center gap-1 text-4xs">
                          <RefreshCw className="h-3 w-3 animate-spin" /> Deep Reasoning Steps
                        </span>
                        {expandedThoughts[msg.id] ? <ChevronUp className="h-3/5 w-3" /> : <ChevronDown className="h-3/5 w-3" />}
                      </button>
                      {expandedThoughts[msg.id] && (
                        <p className="text-[10px] leading-relaxed font-sans text-stone-400 whitespace-pre-line border-t border-stone-900 pt-2 bg-stone-900/20 p-2 rounded">
                          {msg.thinking}
                        </p>
                      )}
                    </div>
                  )}

                  <div className={`p-3 rounded-2xl max-w-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user" 
                      ? "bg-cyan-600 text-stone-950 font-bold" 
                      : "bg-stone-950 border border-stone-800/80 text-stone-200"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-stone-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span className="text-3xs text-stone-400 font-mono italic animate-pulse">Cortex routing answers...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Form message sender controls panel */}
          <div className="p-3 bg-stone-950/60 border-t border-stone-800/80 flex items-center gap-3">
            <button
              onClick={() => setUseThinking(prev => !prev)}
              id="thought-toggle-chk"
              className={`px-3 py-2 rounded-xl text-4xs uppercase tracking-widest font-extrabold transition border flex items-center gap-1.5 cursor-pointer ${
                useThinking
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-500"
                  : "bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
            >
              <Sparkles className="h-3 w-3" /> Thinking Mode
            </button>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendChatMessage(); }}
              placeholder={useThinking ? "Ask a complex coding/math query..." : "Ask me anything..."}
              className="flex-1 bg-stone-950/80 border border-stone-850 rounded-xl px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSendChatMessage}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-stone-950 rounded-xl transition cursor-pointer"
            >
              <Send className="h-4 w-4 stroke-[2.5px]" />
            </button>
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TAB: 2. Image Forge */}
      {activeTab === "imagify" && (
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-stone-800">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-4xs text-stone-500 uppercase tracking-widest font-bold">Describe Your Image</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="A majestic cyber lion with neon cyan eyes walking down a dark neon Tokyo alleyway, photorealistic render..."
                rows={3}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Aspect selection */}
              <div className="space-y-1.5">
                <span className="block text-4xs text-stone-500 uppercase tracking-widest font-bold">Aspect Ratio</span>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                >
                  <option value="1:1">Square (1:1)</option>
                  <option value="16:9">Wide (16:9)</option>
                  <option value="9:16">Portrait (9:16)</option>
                </select>
              </div>

              {/* Quality selection */}
              <div className="space-y-1.5">
                <span className="block text-4xs text-stone-500 uppercase tracking-widest font-bold">Resolution Mode</span>
                <button
                  onClick={() => setIsHighQuality(prev => !prev)}
                  className={`w-full py-2 rounded-xl text-4xs uppercase tracking-widest font-extrabold border transition ${
                    isHighQuality 
                      ? "bg-purple-950/20 border-purple-500/50 text-purple-400" 
                      : "bg-stone-950 border-stone-800 text-stone-400"
                  }`}
                >
                  {isHighQuality ? "1K High resolution" : "512px Standard"}
                </button>
              </div>
            </div>

            <button
              onClick={handleForgeImage}
              disabled={isImageLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-stone-950 font-extrabold text-xs tracking-widest uppercase py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
            >
              {isImageLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-stone-950" /> Forging Cyber Alloy Image...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Forge Image Stream
                </>
              )}
            </button>
          </div>

          {/* Generated Forged image rendering wall */}
          <div className="space-y-3 pt-2">
            <span className="block text-4xs text-stone-500 uppercase tracking-widest font-bold">COLLECTED FORGED SHARDS</span>
            {forgedImages.length === 0 ? (
              <p className="text-3xs text-stone-600 italic">No assets forged in this session yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-3">
                {forgedImages.map((img) => (
                  <div key={img.id} className="bg-stone-950 border border-stone-800/80 rounded-xl overflow-hidden group relative">
                    {/* Standard Image with referrer tags */}
                    <img
                      src={img.url}
                      alt={img.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full object-cover aspect-video group-hover:scale-105 duration-300 transition"
                    />
                    <div className="p-2 space-y-1">
                      <p className="text-[10px] text-stone-300 truncate font-sans" title={img.prompt}>
                        {img.prompt}
                      </p>
                      <span className="text-4xs text-stone-500">{img.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TAB: 3. Voice Live API Connected Panel */}
      {activeTab === "voice" && (
        <LiveVoiceChannel />
      )}

    </div>
  );
}
