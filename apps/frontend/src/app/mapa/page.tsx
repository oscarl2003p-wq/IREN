'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Navigation, PersonStanding, Box, Map, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import jsQR from 'jsqr';

const HospitalScene = dynamic(() => import('@/components/map-3d/HospitalScene').then(mod => mod.HospitalScene), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] flex items-center justify-center bg-[#FDFBF7] text-teal-700 font-semibold rounded-xl">Cargando Entorno 3D...</div>
});

// Coordenadas absolutas (porcentaje) de los waypoints de la ruta
const WAYPOINTS = [
  { x: 20, y: 40 },   // Admisión (Estás aquí)
  { x: 20, y: 52 },   // Bajar al pasillo
  { x: 48, y: 52 },   // Centro del pasillo
  { x: 80, y: 52 },   // Subir al destino
  { x: 80, y: 42 },   // Oncología (Destino)
];

function buildSvgPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

export default function MapaPage() {
  const router = useRouter();
  const [isRouteStarted, setIsRouteStarted] = useState(false);
  const [walkerProgress, setWalkerProgress] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');
  const [startWaypointIndex, setStartWaypointIndex] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const svgPath = buildSvgPath(WAYPOINTS);

  const handleScanResult = (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      if (data.waypointIndex !== undefined) {
         let targetDist = 0;
         let totalLen = 0;
         const segments: number[] = [];
         for (let i = 1; i < WAYPOINTS.length; i++) {
           const dx = WAYPOINTS[i].x - WAYPOINTS[i - 1].x;
           const dy = WAYPOINTS[i].y - WAYPOINTS[i - 1].y;
           const len = Math.sqrt(dx * dx + dy * dy);
           segments.push(len);
           totalLen += len;
           if (i <= data.waypointIndex) {
             targetDist += len;
           }
         }
         const newProgress = data.waypointIndex === 0 ? 0 : targetDist / totalLen;
         setWalkerProgress(newProgress);
         setStartWaypointIndex(data.waypointIndex);
         setIsRouteStarted(true);
         setArrived(false);
         setIsScannerOpen(false);
         alert("📍 Ubicación actualizada: " + data.message);
      }
    } catch(e) {
      alert("El código QR escaneado no es válido para el hospital.");
      setIsScannerOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          handleScanResult(code.data);
        } else {
          alert("No se encontró ningún código QR en la imagen.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  const handleStartRoute = () => {
    setIsRouteStarted(true);
    setWalkerProgress(0);
    setArrived(false);
  };

  // Calcular posición interpolada del caminante
  const getWalkerPosition = (progress: number) => {
    if (WAYPOINTS.length < 2) return WAYPOINTS[0];

    // Calcular longitudes de segmentos
    const segments: number[] = [];
    let totalLen = 0;
    for (let i = 1; i < WAYPOINTS.length; i++) {
      const dx = WAYPOINTS[i].x - WAYPOINTS[i - 1].x;
      const dy = WAYPOINTS[i].y - WAYPOINTS[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      segments.push(len);
      totalLen += len;
    }

    const targetDist = progress * totalLen;
    let accumulated = 0;
    for (let i = 0; i < segments.length; i++) {
      if (accumulated + segments[i] >= targetDist) {
        const t = (targetDist - accumulated) / segments[i];
        return {
          x: WAYPOINTS[i].x + t * (WAYPOINTS[i + 1].x - WAYPOINTS[i].x),
          y: WAYPOINTS[i].y + t * (WAYPOINTS[i + 1].y - WAYPOINTS[i].y),
        };
      }
      accumulated += segments[i];
    }
    return WAYPOINTS[WAYPOINTS.length - 1];
  };

  const walkerPos = getWalkerPosition(walkerProgress);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <header className="max-w-5xl mx-auto flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4 text-gray-600 hover:text-teal-700 text-base h-12 px-5">
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver al dashboard
        </Button>
      </header>

      <main className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-lg rounded-2xl overflow-hidden border-teal-100">
            <CardContent className="p-0">
              <div className="p-6 md:p-8 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Mapa del Hospital</h2>
                  <p className="text-gray-500 text-base mt-1">Tu próximo destino: <strong className="text-teal-700">Consultorio 4 — Oncología · Piso 2</strong></p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsScannerOpen(true)}
                    className="h-14 px-5 text-lg rounded-xl border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <Camera className="w-5 h-5 mr-2" /> Escanear QR
                  </Button>

                  {!isRouteStarted ? (
                    <Button
                      onClick={handleStartRoute}
                      className="bg-teal-600 hover:bg-teal-700 text-white h-14 px-8 text-lg rounded-xl shadow-md animate-pulse hover:animate-none"
                    >
                      <Navigation className="w-6 h-6 mr-3" /> Iniciar Ruta
                    </Button>
                ) : arrived ? (
                  <div className="bg-emerald-100 text-emerald-800 font-bold px-6 py-3 rounded-xl text-base border border-emerald-200">
                    ✓ ¡Has llegado a tu destino!
                  </div>
                ) : (
                  <div className="bg-teal-50 text-teal-700 font-medium px-5 py-3 rounded-xl text-sm border border-teal-200 flex items-center">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                      <PersonStanding className="w-5 h-5 mr-2" />
                    </motion.div>
                    Caminando hacia tu destino...
                  </div>
                )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode(prev => prev === '2D' ? '3D' : '2D')}
                  className="h-14 px-6 rounded-xl font-semibold border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100"
                >
                  {viewMode === '2D' ? <><Box className="w-5 h-5 mr-2" /> Ver en 3D</> : <><Map className="w-5 h-5 mr-2" /> Ver en 2D</>}
                </Button>
              </div>

              {/* Mapa */}
              {viewMode === '3D' ? (
                <div className="w-full bg-[#FAFAF8] rounded-b-2xl overflow-hidden border-t">
                  <HospitalScene startWaypointIndex={startWaypointIndex} />
                </div>
              ) : (
                <>
                  <div
                    className="relative w-full bg-[#FAFAF8] overflow-hidden border-t"
                style={{
                  aspectRatio: '16 / 10',
                  backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              >
                {/* Cuartos */}
                <div className="absolute top-[15%] left-[8%] w-[22%] h-[28%] bg-red-50 rounded-xl border-2 border-red-400 flex flex-col items-center justify-center font-bold text-red-800 shadow-sm z-10 text-sm md:text-base">
                  <span className="text-2xl mb-1">🚑</span>
                  Emergencia
                </div>
                <div className="absolute top-[15%] left-[36%] w-[20%] h-[28%] bg-green-50 rounded-xl border-2 border-green-400 flex flex-col items-center justify-center font-bold text-green-800 shadow-sm z-10 text-sm md:text-base">
                  <span className="text-2xl mb-1">🩺</span>
                  Triaje
                </div>
                <div className="absolute top-[15%] left-[64%] w-[28%] h-[30%] bg-blue-50 rounded-xl border-[3px] border-blue-600 flex flex-col items-center justify-center shadow-lg z-10">
                  <span className="text-2xl mb-1">🎯</span>
                  <div className="font-bold text-blue-900 text-base md:text-lg">Oncología</div>
                  <div className="text-blue-700 text-xs md:text-sm">Consultorio 4</div>
                </div>

                <div className="absolute top-[60%] left-[8%] w-[25%] h-[25%] bg-[#F5F2EC] rounded-xl border border-gray-200 flex flex-col items-center justify-center font-semibold text-gray-500 shadow-sm z-10 text-sm md:text-base">
                  <span className="text-2xl mb-1">🔬</span>
                  Laboratorio
                </div>
                <div className="absolute top-[60%] left-[35%] w-[25%] h-[25%] bg-blue-50 rounded-xl border-2 border-blue-400 flex flex-col items-center justify-center font-bold text-blue-800 shadow-sm z-10 text-sm md:text-base">
                  <span className="text-2xl mb-1">🍎</span>
                  Nutrición
                </div>
                <div className="absolute top-[60%] left-[62%] w-[30%] h-[25%] bg-blue-50 rounded-xl border-2 border-blue-400 flex flex-col items-center justify-center font-bold text-blue-800 shadow-sm z-10 text-sm md:text-base">
                  <span className="text-2xl mb-1">☢️</span>
                  Radioterapia
                </div>

                {/* SVG Route Layer */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-20">
                  {/* Línea base gris */}
                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />

                  {/* Línea animada teal */}
                  <AnimatePresence>
                    {isRouteStarted && (
                      <motion.path
                        d={svgPath}
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                      />
                    )}
                  </AnimatePresence>
                </svg>

                {/* Punto: Estás aquí (Rojo) */}
                <motion.div
                  className="absolute w-5 h-5 md:w-6 md:h-6 bg-red-600 rounded-full z-30"
                  style={{ top: `${WAYPOINTS[0].y}%`, left: `${WAYPOINTS[0].x}%`, transform: 'translate(-50%, -50%)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute z-30 text-red-700 font-bold text-xs md:text-sm bg-white/90 px-2 py-0.5 rounded-md shadow-sm"
                  style={{ top: `${WAYPOINTS[0].y + 4}%`, left: `${WAYPOINTS[0].x}%`, transform: 'translateX(-50%)' }}
                >
                  📍 Estás aquí
                </motion.div>

                {/* Punto: Destino (Verde) */}
                <motion.div
                  className="absolute w-5 h-5 md:w-6 md:h-6 bg-teal-700 rounded-full z-30"
                  style={{ top: `${WAYPOINTS[WAYPOINTS.length - 1].y}%`, left: `${WAYPOINTS[WAYPOINTS.length - 1].x}%`, transform: 'translate(-50%, -50%)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                />

                {/* Persona caminando animada */}
                <AnimatePresence>
                  {isRouteStarted && !arrived && (
                    <motion.div
                      className="absolute z-40 flex flex-col items-center"
                      style={{
                        top: `${walkerPos.y - 6}%`,
                        left: `${walkerPos.x}%`,
                        transform: 'translateX(-50%)',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        top: `${walkerPos.y - 6}%`,
                        left: `${walkerPos.x}%`,
                      }}
                      transition={{ duration: 0.1 }}
                    >
                      <motion.div
                        className="bg-blue-600 text-white rounded-full w-9 h-9 md:w-11 md:h-11 flex items-center justify-center shadow-xl border-2 border-white"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <PersonStanding className="w-5 h-5 md:w-6 md:h-6" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Animación del progreso del caminante */}
                {isRouteStarted && !arrived && (
                  <motion.div
                    className="hidden"
                    animate={{ opacity: 1 }}
                    transition={{ duration: 6 }}
                    onUpdate={(latest) => {
                      // Usamos un truco: onUpdate nos da el progreso de la animación
                    }}
                  />
                )}
              </div>

              {/* Leyenda */}
              <div className="p-5 border-t bg-gray-50 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm md:text-base text-gray-600">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-full"></div> Tu ubicación</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-teal-700 rounded-full"></div> Destino</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded-full"></div> Persona caminando</div>
                <div className="flex items-center gap-2"><div className="w-6 border-t-2 border-dashed border-teal-600"></div> Ruta (~2 min)</div>
              </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="text-center mt-10 text-base text-gray-400 pb-8">
        ¿Necesitas ayuda? Llama al <span className="font-semibold text-gray-600">(044) 232-323</span> · Disponible 24/7
      </footer>

      {/* Timer para animar el caminante paso a paso */}
      {isRouteStarted && !arrived && (
        <WalkerAnimator
          onProgress={(p) => setWalkerProgress(p)}
          onComplete={() => setArrived(true)}
          durationMs={5000}
        />
      )}

      {/* Modal del Escáner QR */}
      {isScannerOpen && (
        <QRScannerModal 
          onClose={() => setIsScannerOpen(false)} 
          onScan={handleScanResult} 
          onFileUpload={handleFileUpload} 
        />
      )}
    </div>
  );
}

// Componente del Escáner QR
function QRScannerModal({ 
  onClose, 
  onScan, 
  onFileUpload 
}: { 
  onClose: () => void, 
  onScan: (code: string) => void, 
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        setError('No se pudo acceder a la cámara. Por favor permite el acceso o usa la opción de subir archivo abajo.');
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        canvasRef.current.height = videoRef.current.videoHeight;
        canvasRef.current.width = videoRef.current.videoWidth;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
          if (code) {
            onScan(code.data);
            return;
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Escanear Código QR</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <div className="relative bg-black min-h-[300px] flex items-center justify-center">
          {error ? (
            <div className="text-white p-4 text-center">{error}</div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-auto max-h-[60vh] object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-green-500/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
              </div>
            </>
          )}
        </div>
        <div className="p-5 flex flex-col items-center gap-3 bg-slate-50 border-t">
          <p className="text-sm text-slate-600 text-center mb-2">Apunta la cámara al código QR ubicado en el hospital.</p>
          <div className="w-full flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 font-bold uppercase">o también</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            id="qr-upload-modal" 
            className="hidden" 
            onChange={(e) => { onFileUpload(e); onClose(); }} 
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('qr-upload-modal')?.click()}
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Subir archivo de QR
          </Button>
        </div>
      </div>
    </div>
  );
}

// Componente invisible que impulsa la animación del caminante
function WalkerAnimator({
  onProgress,
  onComplete,
  durationMs,
}: {
  onProgress: (p: number) => void;
  onComplete: () => void;
  durationMs: number;
}) {
  const [started] = useState(() => Date.now());

  // Usar requestAnimationFrame para suavizar la animación
  useState(() => {
    let frameId: number;
    const animate = () => {
      const elapsed = Date.now() - started;
      const progress = Math.min(elapsed / durationMs, 1);
      onProgress(progress);
      if (progress >= 1) {
        onComplete();
        return;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  });

  return null;
}
