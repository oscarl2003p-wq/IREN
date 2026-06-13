'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';
import { fetchApi } from '@/lib/api-client';
import { LogIn, Stethoscope, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorLoginPage() {
  const router = useRouter();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginAction = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!dni || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchApi<{ success: boolean; token: string; doctor: any }>('/auth/doctor-login', {
        method: 'POST',
        body: JSON.stringify({ dni, password }),
      });

      if (data.success) {
        loginAction({ ...data.doctor, role: 'doctor' }, data.token);
        router.push('/doctor/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="text-center space-y-4 bg-slate-900 text-white rounded-t-xl pb-8 pt-8">
            <div className="mx-auto bg-white/10 w-16 h-16 flex items-center justify-center rounded-full">
              <Stethoscope size={32} className="text-blue-300" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-wide">Portal Especialistas</CardTitle>
              <CardDescription className="text-slate-300 mt-2 text-base">
                Acceso exclusivo para personal médico del IREN
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dni" className="text-slate-700 text-base">Documento de Identidad</Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="Ej: 12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="text-lg p-6 border-slate-300 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 text-base">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-lg p-6 border-slate-300 focus-visible:ring-blue-500"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg mt-4">
                {isLoading ? (
                  <span className="flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...</span>
                ) : (
                  <span className="flex items-center"><LogIn className="mr-2 h-5 w-5" /> Acceder al Panel</span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center py-4 bg-slate-50 rounded-b-xl border-t border-slate-100 text-sm text-slate-500">
            &copy; 2026 IREN - Sistema Hospitalario
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}
