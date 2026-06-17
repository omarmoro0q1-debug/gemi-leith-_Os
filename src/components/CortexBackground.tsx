/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Telemetry, OSConfig } from "../types";

interface CanvasProps {
  telemetry: Telemetry;
  config: OSConfig;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
}

export default function CortexBackground({ telemetry, config }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; alpha: number; color: string }[]>([]);

  // Setup ResizeObserver for responsive canvas sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Handle ambient or user interactive draw loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let localFrame = 0;

    const render = () => {
      localFrame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isWarrior = config.mode === "warrior";
      const isAod = config.mode === "aod";
      const isLock = config.mode === "lock";
      const isHot = telemetry.cpuTemp > 75;

      // Draw Atmospheric Base Gradient
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        isAod ? 10 : 50,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );

      // Dynamically formulate colors based on mode and thermal telemetry
      if (isAod) {
        // Deep total black for battery saving, barely perceptible glow
        grad.addColorStop(0, "rgba(2, 2, 2, 1)");
        grad.addColorStop(1, "rgba(0, 0, 0, 1)");
      } else if (isWarrior) {
        // Deep Obsidian and crimson cyberware palette
        grad.addColorStop(0, "rgba(22, 0, 0, 0.9)");
        grad.addColorStop(0.5, "rgba(5, 0, 0, 0.95)");
        grad.addColorStop(1, "rgba(0, 0, 0, 1)");
      } else if (isHot) {
        // Warning Thermal Hue
        grad.addColorStop(0, "rgba(35, 12, 5, 0.95)");
        grad.addColorStop(0.5, "rgba(15, 5, 2, 0.98)");
        grad.addColorStop(1, "rgba(3, 1, 0, 1)");
      } else {
        // Cosmos Slate & soft dark blue-green of standard GemiLeith
        let op = isLock ? 0.98 : 0.92;
        grad.addColorStop(0, `rgba(10, 20, 32, ${op})`);
        grad.addColorStop(0.5, `rgba(5, 10, 18, 0.98)`);
        grad.addColorStop(1, "rgba(2, 4, 8, 1)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!isAod) {
        // Draw subtle orbital paths representing cosmic framework
        ctx.save();
        ctx.strokeStyle = isWarrior ? "rgba(239, 68, 68, 0.04)" : "rgba(14, 165, 233, 0.05)";
        ctx.lineWidth = 1.5;
        const centerCircleX = canvas.width / 2;
        const centerCircleY = canvas.height / 2;
        const orbits = [150, 300, 450, 600];
        orbits.forEach((r, i) => {
          ctx.beginPath();
          ctx.arc(centerCircleX, centerCircleY, r + Math.sin(localFrame * 0.01 + i) * 6, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();

        // Atmospheric ambient cloud gas rendering
        ctx.save();
        const gasRadius = 350 + Math.sin(localFrame * 0.005) * 40;
        const gasGrad = ctx.createRadialGradient(
          centerCircleX + Math.cos(localFrame * 0.003) * 100,
          centerCircleY + Math.sin(localFrame * 0.002) * 100,
          50,
          centerCircleX,
          centerCircleY,
          gasRadius
        );
        if (isWarrior) {
          gasGrad.addColorStop(0, "rgba(153, 27, 27, 0.15)");
          gasGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          let alpha1 = isLock ? "0.08" : "0.12";
          let alpha2 = isLock ? "0.03" : "0.05";
          gasGrad.addColorStop(0, `rgba(14, 116, 144, ${alpha1})`);
          gasGrad.addColorStop(0.5, `rgba(124, 58, 237, ${alpha2})`);
          gasGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        }
        ctx.fillStyle = gasGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Ambient system breathing ticker node
      ctx.save();
      ctx.beginPath();
      const dotPulse = isAod 
        ? 2 + Math.sin((localFrame * Math.PI * 2) / (config.systemBreathInterval / 8)) * 1 
        : 4 + Math.sin((localFrame * Math.PI * 2) / (config.systemBreathInterval / 16)) * 2;
      ctx.arc(isAod ? canvas.width/2 : 40, isAod ? canvas.height - 40 : 40, dotPulse, 0, Math.PI * 2);
      ctx.fillStyle = isWarrior ? "rgba(239, 68, 68, 0.6)" : isAod ? "rgba(168, 162, 158, 0.2)" : "rgba(34, 197, 94, 0.6)";
      ctx.shadowColor = isWarrior ? "#ef4444" : isAod ? "#a8a29e" : "#22c55e";
      ctx.shadowBlur = dotPulse * 3;
      ctx.fill();
      ctx.restore();

      // Render ripples (Forces generated by clicking)
      ripplesRef.current.forEach((rip, idx) => {
        rip.radius += 3 + (telemetry.cpuLoad * 0.04);
        rip.alpha -= 0.015;
        if (rip.alpha <= 0) {
          ripplesRef.current.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = rip.alpha;
        ctx.lineWidth = 1.5 + (telemetry.touchPressure * 3);
        ctx.stroke();
        ctx.restore();
      });

      // Update & Render Stardust/Flares particles
      const speedMod = 1 + (telemetry.cpuLoad / 100) * 0.8;
      const breathCycle = Math.sin((Date.now() % 4000) / 4000 * Math.PI * 2);
      const breathAlpha = 0.6 + breathCycle * 0.4; 
      
      ctx.save();
      ctx.globalAlpha = breathAlpha;
      ctx.filter = `blur(${1 + breathCycle * 1}px)`;

      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx * speedMod;
        p.y += p.vy * speedMod;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(idx, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const pAlpha = p.alpha * breathAlpha;
        ctx.globalAlpha = pAlpha;
        ctx.fillStyle = p.color;
        ctx.fill();
        
      });
      ctx.restore();

      // Spawn ambient micro space debris occasionally
      if (Math.random() < 0.05 + (telemetry.cpuLoad * 0.001)) {
        const pColor = isWarrior ? "rgba(239, 68, 68, 0.4)" : "rgba(14, 165, 233, 0.3)";
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.5 + 0.2,
          size: Math.random() * 1.5 + 0.5,
          color: pColor,
          decay: 0.002,
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [dimensions, telemetry, config]);

  // Custom event listener for global click ripples over Home Layout
  useEffect(() => {
    const handleCosmicRipple = (e: CustomEvent) => {
      const { x, y } = e.detail;
      const isWarrior = config.mode === "warrior";
      const forceColor = isWarrior 
        ? `hsl(${0 + Math.random() * 20}, 90%, 60%)` 
        : `hsl(${190 + Math.random() * 40}, 90%, 60%)`;

      ripplesRef.current.push({
        x, y,
        radius: 5,
        maxRadius: 150 + telemetry.touchPressure * 100,
        alpha: 0.8,
        color: forceColor,
      });

      const particleCount = 20 + Math.floor(telemetry.touchPressure * 15);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 0.8;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1.0,
          size: Math.random() * 2.5 + 1.0,
          color: forceColor,
          decay: Math.random() * 0.03 + 0.015,
        });
      }
    };

    window.addEventListener("cosmic-ripple" as any, handleCosmicRipple);
    return () => window.removeEventListener("cosmic-ripple" as any, handleCosmicRipple);
  }, [config.mode, telemetry.touchPressure]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block w-full h-full"
      />
    </div>
  );
}
