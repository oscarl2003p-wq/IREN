'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';
import { fetchApi } from '@/lib/api-client';
import { Camera, RefreshCw, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [dni, setDni] = useState('');
  const [pin, setPin] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loginAction = useAuthStore((state) => state.login);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Detener cámara al desmontar
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Tu navegador no soporta el acceso a la cámara o no estás en localhost/HTTPS.');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      setError('No se pudo acceder a la cámara. Por favor, otorge los permisos.');
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhoto(imageDataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!dni || dni.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }

    if (!pin) {
      setError('Se requiere el PIN de acceso');
      return;
    }

    if (!photo) {
      setError('Se requiere una fotografía para la validación facial simulada');
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchApi<{ success: boolean; token: string; patient: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ dni, pin, photoBase64: photo }),
      });

      if (data.success) {
        loginAction(data.patient, data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error en el login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-[#FDFBF7]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-teal-100">
          <CardHeader className="text-center space-y-3 pt-8 pb-4">
            <div className="mx-auto bg-teal-50 w-16 h-16 flex items-center justify-center rounded-full border-2 border-teal-200 mb-2">
              <span className="text-3xl">🏥</span>
            </div>
            <CardTitle className="text-3xl font-bold text-teal-800">Ruta Inteligente</CardTitle>
            <CardDescription className="text-gray-500 text-base">
              Verificación biométrica requerida para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dni" className="text-teal-900 text-base font-semibold">Documento de Identidad (DNI)</Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="Ej: 78451236"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-xl tracking-widest border-teal-200 focus-visible:ring-teal-500 h-14"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-teal-900 text-base font-semibold">PIN de Acceso</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="****"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-xl tracking-widest border-teal-200 focus-visible:ring-teal-500 h-14"
                />
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <Label className="self-start text-teal-900 text-base font-semibold">Validación Facial (Simulada)</Label>
                
                {!photo && !isCameraActive && (
                  <Button type="button" variant="outline" className="w-full h-32 border-dashed border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-400" onClick={startCamera}>
                    <div className="flex flex-col items-center space-y-2 text-teal-600">
                      <Camera size={36} />
                      <span className="text-base">Activar Cámara</span>
                    </div>
                  </Button>
                )}

                {!photo && isCameraActive && (
                  <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <Button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-teal-600 hover:bg-teal-700 rounded-full shadow-lg h-12 px-6 text-base">
                      <Camera className="mr-2 h-5 w-5" /> Capturar Foto
                    </Button>
                  </div>
                )}

                {photo && (
                  <div className="relative w-full rounded-lg overflow-hidden border-2 border-teal-200">
                    <img src={photo} alt="Foto capturada" className="w-full object-cover" />
                    <Button type="button" variant="secondary" size="sm" onClick={retakePhoto} className="absolute top-2 right-2 opacity-90 hover:opacity-100 bg-white/95 shadow-md">
                      <RefreshCw className="mr-2 h-4 w-4" /> Repetir
                    </Button>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-base rounded-lg border border-red-200 font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading || !photo || dni.length !== 8 || pin.length < 4} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold h-14 text-lg rounded-xl">
                {isLoading ? (
                  <span className="flex items-center"><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Verificando...</span>
                ) : (
                  <span className="flex items-center"><LogIn className="mr-2 h-5 w-5" /> Ingresar</span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-3 pt-2 pb-6">
            <p className="text-sm text-gray-400">IREN — Instituto Regional de Enfermedades Neoplásicas</p>
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-sm text-teal-600 hover:text-teal-800 hover:underline font-bold transition-colors"
            >
              ¿No estás registrado? Crea tu perfil como paciente aquí
            </button>
            <button
              type="button"
              onClick={() => router.push('/doctor/login')}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            >
              ¿Eres especialista? Accede al Portal Médico →
            </button>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}
