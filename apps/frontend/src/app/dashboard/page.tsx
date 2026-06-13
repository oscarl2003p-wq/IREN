'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { fetchApi } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar, Clock, MapPin, Phone, LogOut,
  Navigation, CheckCircle2, Circle, Clock4, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) {
      router.push('/');
    }
  }, [_hasHydrated, token, router]);

  const { data: appointmentData, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ['appointment', user?.id],
    queryFn: () => fetchApi<any>(`/appointments/current/${user?.id}`),
    enabled: !!user?.id,
  });

  const { data: routeData, isLoading: isLoadingRoute } = useQuery({
    queryKey: ['route', user?.id],
    queryFn: () => fetchApi<any>(`/routes/${user?.id}`),
    enabled: !!user?.id,
  });

  if (!_hasHydrated || !user) return null;

  const appointment = appointmentData?.data;
  const route = routeData?.data;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      {/* Header – Accesible y con tipografía grande */}
      <header className="max-w-4xl mx-auto flex justify-between items-start mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-500 shadow-sm mb-4 border border-gray-100">
            <span className="text-red-500 text-lg">♥</span>
            <span>IREN — Instituto Regional de Enfermedades Neoplásicas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center">
            Hola, {user.firstName} <span className="ml-2 text-3xl">👋</span>
          </h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg">
            Esta es tu ruta de atención de hoy. Estamos contigo en cada paso.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="rounded-full h-12 px-5 border-teal-200 text-teal-700 hover:bg-teal-50 text-base font-semibold"
            onClick={() => router.push('/historial')}
          >
            <FileText size={20} className="mr-2" /> Mi Historial
          </Button>
          <Button
            variant="outline"
            className="rounded-full h-12 px-5 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-base"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-2" /> Salir
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* Próxima Cita */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-t-4 border-t-teal-500 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-[#E8F3F1] text-teal-800 px-4 py-2 rounded-full text-base font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  PRÓXIMA CITA
                </div>
                <span className="text-gray-400 font-medium text-base">Hoy</span>
              </div>

              {isLoadingAppointment ? (
                <div className="h-24 flex items-center justify-center text-gray-400 text-lg">Cargando cita...</div>
              ) : appointment ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <div className="text-sm text-gray-400 uppercase font-semibold mb-1 tracking-wider">Doctor</div>
                    <div className="font-bold text-gray-900 text-xl">
                      {appointment.doctorName}
                    </div>
                    <div className="text-base text-gray-500 mt-1">{appointment.specialty}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 uppercase font-semibold mb-1 tracking-wider">Consultorio</div>
                    <div className="font-bold text-gray-900 flex items-center text-xl">
                      <MapPin className="w-5 h-5 mr-1 text-teal-500" />
                      {appointment.room}
                    </div>
                    <div className="text-base text-gray-500 mt-1">{appointment.floor}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 uppercase font-semibold mb-1 tracking-wider">Hora</div>
                    <div className="font-bold text-gray-900 text-3xl">
                      {appointment.time}
                    </div>
                    <div className="text-base text-teal-600 font-medium mt-1">Llega 15 min antes</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-lg py-4">No hay citas para hoy.</div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8 h-14 text-lg shadow-md"
                  onClick={() => router.push('/mapa')}
                >
                  <Navigation className="w-5 h-5 mr-3" /> Cómo llegar
                </Button>
                <Button variant="outline" className="rounded-xl px-8 h-14 text-lg bg-gray-50 border-gray-200">
                  <Phone className="w-5 h-5 mr-3" /> Contactar enfermería
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ruta de Atención */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tu ruta de atención</h2>
                <span className="text-base font-semibold text-gray-500">{route?.currentProgress || 0}% completado</span>
              </div>

              <Progress value={route?.currentProgress || 0} className="h-3 mb-10 bg-gray-100 [&>div]:bg-teal-600 rounded-full" />

              {isLoadingRoute ? (
                <div className="text-center text-gray-400 py-8 text-lg">Cargando ruta...</div>
              ) : route ? (
                <div className="relative border-l-2 border-gray-100 ml-5 space-y-8 pb-4">
                  {route.steps.map((step: any, index: number) => {
                    const isCompleted = step.status === 'completed';
                    const isInProgress = step.status === 'in_progress';

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="relative pl-8"
                      >
                        {/* Indicador del Timeline */}
                        <div className="absolute -left-[17px] top-1 rounded-full p-1 bg-[#FDFBF7]">
                          {isCompleted ? (
                            <div className="bg-teal-500 rounded-full p-1 text-white">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          ) : isInProgress ? (
                            <div className="bg-teal-600 rounded-full p-1 text-white shadow-lg shadow-teal-200">
                              <Clock4 className="w-6 h-6 animate-pulse" />
                            </div>
                          ) : (
                            <div className="bg-gray-100 border-2 border-gray-200 rounded-full p-1 text-gray-300">
                              <Circle className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Contenido del paso */}
                        <div className={`border rounded-xl p-5 md:p-6 transition-all ${
                          isCompleted ? 'bg-white border-gray-100' :
                          isInProgress ? 'bg-white border-teal-200 shadow-md ring-1 ring-teal-50' :
                          'bg-gray-50 border-gray-100 opacity-60'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className={`font-bold text-lg md:text-xl ${isInProgress ? 'text-teal-800' : 'text-gray-900'}`}>
                                {step.name}
                              </h3>
                              <p className="text-gray-500 text-base mt-1 whitespace-pre-line">{step.description}</p>
                              {step.timeCompleted && (
                                <p className="text-gray-400 text-sm mt-2">Completado a las {step.timeCompleted}</p>
                              )}
                            </div>
                            <div className={`text-sm font-semibold px-4 py-1.5 rounded-full whitespace-nowrap ${
                              isCompleted ? 'bg-teal-100 text-teal-700' :
                              isInProgress ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {isCompleted ? 'Completado' : isInProgress ? 'En curso' : 'Pendiente'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8 text-lg">No hay rutas activas.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="text-center mt-10 text-base text-gray-400 pb-8">
        ¿Necesitas ayuda? Llama al <span className="font-semibold text-gray-600">(044) 232-323</span> · Disponible 24/7
      </footer>
    </div>
  );
}
