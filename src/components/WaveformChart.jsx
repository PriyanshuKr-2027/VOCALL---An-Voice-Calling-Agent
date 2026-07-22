import React from 'react';
import { motion } from 'framer-motion';

export function WaveformChart() {
  const volumeData = [22, 34, 28, 46, 40, 58, 52, 68, 62, 74, 66, 82, 78, 90];
  const emotionData = [0.4, 0.42, 0.5, 0.48, 0.55, 0.6, 0.58, 0.65, 0.62, 0.7, 0.68, 0.74, 0.72, 0.78];
  
  const maxVal = Math.max(...volumeData);
  
  const generatePath = (data, scale = 1) => {
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 720;
      const y = 120 - (val / (scale || maxVal)) * 100 - 10;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const volumePath = generatePath(volumeData);
  const emotionPath = generatePath(emotionData, 1);

  return (
    <svg viewBox="0 0 720 120" className="mt-3 h-28 w-full overflow-visible">
      <defs>
        <linearGradient id="callFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#202124" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#202124" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1="0"
          x2="720"
          y1={120 * ratio}
          y2={120 * ratio}
          stroke="#e6e4df"
          strokeDasharray="2 4"
        />
      ))}

      {/* Volume Gradient Area */}
      <path d={`${volumePath} L720,120 L0,120 Z`} fill="url(#callFill)" />

      {/* Volume Line */}
      <motion.path
        d={volumePath}
        fill="none"
        stroke="#202124"
        strokeWidth="1.6"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />

      {/* Emotion Arc Dotted Line */}
      <motion.path
        d={emotionPath}
        fill="none"
        stroke="#4f7a65"
        strokeWidth="1.6"
        strokeDasharray="4 3"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: 0.2, ease: 'easeOut' }}
      />
    </svg>
  );
}
