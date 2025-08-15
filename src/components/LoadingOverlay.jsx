import React from "react";
import { Progress } from "./ui/progress";

export default function LoadingOverlay({ progress = 0, show = false, text = "Carregando modelo 3D..." }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[280px] rounded-xl border border-white/10 bg-white/[0.06] p-4 text-white">
        <div className="text-sm mb-2 opacity-80">{text}</div>
        <Progress value={progress} className="w-full" />
        <div className="mt-2 text-xs opacity-60">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}