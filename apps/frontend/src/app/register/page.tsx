'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    pin: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar paciente');
    } finally {
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
              <UserPlus className="text-white w-10 h-10" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-extrabold text-[#003B73]">
                Registro de Pacientes
              </CardTitle>
              <CardDescription className="text-[#005792] text-lg mt-2 font-medium">
                Regístrate por única vez para acceder al sistema
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {success ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="text-green-600 font-bold text-2xl">¡Registro exitoso!</div>
                <p className="text-gray-600">Redirigiendo al inicio de sesión...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="dni" className="text-[#003B73] text-lg font-bold">DNI</Label>
                  <Input
                    id="dni"
                    name="dni"
                    type="text"
                    required
                    value={formData.dni}
                    onChange={handleChange}
                    className="text-xl bg-[#F8FAFC] border-[#BDE0FE] focus-visible:ring-[#0083B0] h-14 rounded-2xl px-5 text-gray-800"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-[#003B73] text-lg font-bold">Nombres</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="text-xl bg-[#F8FAFC] border-[#BDE0FE] focus-visible:ring-[#0083B0] h-14 rounded-2xl px-5 text-gray-800"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-[#003B73] text-lg font-bold">Apellidos</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="text-xl bg-[#F8FAFC] border-[#BDE0FE] focus-visible:ring-[#0083B0] h-14 rounded-2xl px-5 text-gray-800"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pin" className="text-[#003B73] text-lg font-bold">PIN (Contraseña)</Label>
                  <Input
                    id="pin"
                    name="pin"
                    type="password"
                    required
                    value={formData.pin}
                    onChange={handleChange}
                    className="text-xl bg-[#F8FAFC] border-[#BDE0FE] focus-visible:ring-[#0083B0] h-14 rounded-2xl px-5 text-gray-800"
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
                  disabled={isLoading} 
                  className={`w-full font-bold h-14 text-xl rounded-2xl transition-all shadow-md bg-gradient-to-r from-[#005792] to-[#0083B0] hover:from-[#003B73] hover:to-[#005792] text-white hover:shadow-lg`}
                >
                  {isLoading ? 'Registrando...' : 'Registrar'}
                </Button>
              </form>
            )}
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
