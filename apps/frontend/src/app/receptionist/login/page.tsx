'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarCheck, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api-client';

import { useAuthStore } from '@/stores/auth.store';

export default function ReceptionistLoginPage() {
  const router = useRouter();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginAction = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response: any = await fetchApi('/auth/receptionist-login', {
        method: 'POST',
        body: JSON.stringify({ dni, password }),
      });

      if (response.success && response.token) {
        // Update auth store
        loginAction({ ...response.user, role: 'receptionist' }, response.token);
        
        // Keep localStorage for compatibility
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', 'receptionist');
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        setTimeout(() => {
          router.push('/receptionist/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#F0F7FA] to-[#E0F2F1]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl">
          <CardHeader className="text-center space-y-4 pt-10 pb-6 bg-[#005792]/5 border-b border-[#005792]/10">
            <motion.div 
              className="mx-auto bg-gradient-to-br from-[#005792] to-[#0083B0] w-20 h-20 flex items-center justify-center rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CalendarCheck className="text-white w-10 h-10" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-extrabold text-[#003B73]">
                Módulo de Admisión
              </CardTitle>
              <CardDescription className="text-[#005792] text-lg mt-2 font-medium">
                Acceso Exclusivo para Recepcionistas
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-7">
              <div className="space-y-3">
                <Label htmlFor="dni" className="text-[#003B73] text-lg font-bold">
                  DNI del Personal
                </Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="Ej: 11111111"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="text-xl bg-[#F8FAFC] border-[#BDE0FE] focus-visible:ring-[#0083B0] h-16 rounded-2xl px-5 text-gray-800 transition-all focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-[#003B73] text-lg font-bold">
                  Contraseña de Acceso
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-xl bg-[#F8FAFC] border-[#BDE0FE] focus-visible:ring-[#0083B0] h-16 rounded-2xl px-5 text-gray-800 transition-all focus:bg-white"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="p-4 bg-red-50 text-red-700 text-lg rounded-2xl border-2 border-red-200 font-bold text-center shadow-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={isLoading || !dni || !password} 
                className={`w-full font-bold h-16 text-xl rounded-2xl transition-all shadow-md ${
                  isLoading 
                  ? 'bg-[#A2D2FF] text-[#003B73] cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#005792] to-[#0083B0] hover:from-[#003B73] hover:to-[#005792] text-white hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-3"
                    >
                      <LogIn className="w-6 h-6" />
                    </motion.div>
                    Accediendo al Módulo...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="mr-3 h-6 w-6" /> Entrar al Sistema
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-gray-50 flex flex-col justify-center pt-6 pb-8 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-base text-[#005792] hover:text-[#003B73] font-semibold transition-colors flex items-center justify-center p-3 rounded-xl hover:bg-blue-50"
            >
              ← Volver al Portal
            </button>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}
