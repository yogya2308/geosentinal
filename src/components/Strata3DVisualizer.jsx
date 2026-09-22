import React, { useEffect, useRef, useState } from 'react';
import { Box, RotateCw, Eye, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Strata3DVisualizer({ maxTilt, maxCrack }) {
  const canvasRef = useRef(null);
  const [rotationAngle, setRotationAngle] = useState(28); // degrees
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  useEffect(() => {
    let animationFrameId;
    if (isAutoRotate) {
      const interval = setInterval(() => {
        setRotationAngle(prev => (prev + 0.3) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAutoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 30;
      const rad = (rotationAngle * Math.PI) / 180;

      // Subsidence factor based on maxTilt (0.0 to 1.0)
      const subsidenceDepth = Math.min(45, (maxTilt / 6.0) * 45);
      const crackGap = Math.min(18, (maxCrack / 4.0) * 18);

      // Isometric projection helper
      const project = (x, y, z) => {
        const rotX = x * Math.cos(rad) - y * Math.sin(rad);
        const rotY = x * Math.sin(rad) + y * Math.cos(rad);
        const isoX = cx + (rotX - rotY) * 1.3;
        const isoY = cy + (rotX + rotY) * 0.65 - z * 1.4;
        return { x: isoX, y: isoY };
      };

      // 1. Draw Subterranean Coal Seam #3 Layer (Deepest: z = 0 to 20)
      const seamColor = '#0f172a';
      const seamBorder = '#334155';

      // 2. Draw Overburden Strata (Sandstone & Shale: z = 20 to 90)
      const strataLayers = [
        { z1: 0, z2: 25, fill: '#1e293b', label: 'Coal Seam #3 (Bituminous)' },
        { z1: 25, z2: 60, fill: '#334155', label: 'Sandy Shale Overburden' },
        { z1: 60, z2: 95, fill: '#475569', label: 'Sandstone Roof Strata' }
      ];

      const w = 110;
      const d = 90;

      strataLayers.forEach((layer) => {
        const p1 = project(-w, -d, layer.z1);
        const p2 = project(w, -d, layer.z1);
        const p3 = project(w, d, layer.z1);
        const p4 = project(-w, d, layer.z1);

        const p1_top = project(-w, -d, layer.z2);
        const p2_top = project(w, -d, layer.z2);
        const p3_top = project(w, d, layer.z2);
        const p4_top = project(-w, d, layer.z2);

        // Draw Left Face
        ctx.fillStyle = layer.fill;
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p4.x, p4.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p3_top.x, p3_top.y);
        ctx.lineTo(p4_top.x, p4_top.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw Right Face
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p2_top.x, p2_top.y);
        ctx.lineTo(p3_top.x, p3_top.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // 3. Draw Surface Layer with Dynamic Subsidence Trough Depression
      const surfaceZ = 95;
      const steps = 14;
      ctx.fillStyle = subsidenceDepth > 20 ? '#7f1d1d' : subsidenceDepth > 10 ? '#78350f' : '#065f46';
      ctx.strokeStyle = '#10b981';

      for (let ix = -w; ix < w; ix += (2 * w) / steps) {
        for (let iy = -d; iy < d; iy += (2 * d) / steps) {
          const nx = ix + (2 * w) / steps;
          const ny = iy + (2 * d) / steps;

          // Subsidence bowl equation: z drops in center
          const distFromCenter1 = Math.sqrt(ix * ix + iy * iy) / (w * 0.8);
          const drop1 = Math.max(0, (1 - distFromCenter1 * distFromCenter1) * subsidenceDepth);

          const distFromCenter2 = Math.sqrt(nx * nx + iy * iy) / (w * 0.8);
          const drop2 = Math.max(0, (1 - distFromCenter2 * distFromCenter2) * subsidenceDepth);

          const distFromCenter3 = Math.sqrt(nx * nx + ny * ny) / (w * 0.8);
          const drop3 = Math.max(0, (1 - distFromCenter3 * distFromCenter3) * subsidenceDepth);

          const distFromCenter4 = Math.sqrt(ix * ix + ny * ny) / (w * 0.8);
          const drop4 = Math.max(0, (1 - distFromCenter4 * distFromCenter4) * subsidenceDepth);

          const pt1 = project(ix, iy, surfaceZ - drop1);
          const pt2 = project(nx, iy, surfaceZ - drop2);
          const pt3 = project(nx, ny, surfaceZ - drop3);
          const pt4 = project(ix, ny, surfaceZ - drop4);

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.lineTo(pt3.x, pt3.y);
          ctx.lineTo(pt4.x, pt4.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      // Draw Crack fissure on surface if crackGap > 3
      if (crackGap > 3) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = Math.min(5, crackGap * 0.8);
        ctx.beginPath();
        const c1 = project(-35, -20, surfaceZ - subsidenceDepth * 0.7);
        const c2 = project(0, 10, surfaceZ - subsidenceDepth);
        const c3 = project(40, 25, surfaceZ - subsidenceDepth * 0.5);
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.stroke();

        // Label crack
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`⚠ TENSION CRACK (${maxCrack.toFixed(1)}mm)`, c2.x - 30, c2.y - 12);
      }

      // Surface Reference Nodes (Beacons on surface)
      const n1 = project(-50, -30, surfaceZ + 4);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(n1.x, n1.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText('NODE-06 (Datum)', n1.x + 6, n1.y);

      // Deep void cavity (underground extraction gallery)
      const cav1 = project(-25, -20, 10);
      const cav2 = project(25, 20, 10);
      ctx.fillStyle = '#020617';
      ctx.fillRect(cav1.x - 15, cav1.y - 10, 35, 18);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText('Goaf Void (Caved Seam)', cav1.x - 20, cav1.y + 22);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [rotationAngle, maxTilt, maxCrack]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
              3D ISOMETRIC GEOLOGICAL STRATA SUBSIDENCE MODEL
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded font-mono">
                REAL-TIME TROUGH DEFORMATION
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Interactive 3D cross-section showing overburden sag and surface tension fractures
            </p>
          </div>
        </div>

        {/* 3D Rotation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
              isAutoRotate 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow' 
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${isAutoRotate ? 'animate-spin' : ''}`} />
            <span>{isAutoRotate ? 'Auto Orbit' : 'Pause'}</span>
          </button>
          
          <input
            type="range"
            min="0"
            max="360"
            value={rotationAngle}
            onChange={(e) => {
              setIsAutoRotate(false);
              setRotationAngle(parseFloat(e.target.value));
            }}
            className="w-20 accent-indigo-500 cursor-pointer"
            title="Rotate 3D View"
          />
        </div>
      </div>

      {/* 3D Canvas Box */}
      <div className="relative rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[300px]">
        <canvas
          ref={canvasRef}
          width={680}
          height={300}
          className="w-full h-full block"
        />

        {/* Real-time deformation badge */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-xl font-mono text-xs text-white">
          <div>Trough Sag: <strong className={maxTilt >= 5.0 ? 'text-red-400' : maxTilt >= 2.5 ? 'text-amber-400' : 'text-emerald-400'}>
            {((maxTilt / 6.0) * 100).toFixed(0)}% Depression
          </strong></div>
          <div className="text-[10px] text-slate-400">Tilt Vector: {maxTilt.toFixed(2)}° • Crack: {maxCrack.toFixed(2)}mm</div>
        </div>

        <div className="absolute bottom-2 right-3 font-mono text-[10px] text-slate-500">
          Surface ➔ Overburden Sandstone ➔ Bituminous Coal Seam #3
        </div>
      </div>

    </div>
  );
}
