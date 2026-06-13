'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, CalendarPlus, UserCheck, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuthStore } from '@/stores/auth.store';

export default function ReceptionistDashboard() {
  const router = useRouter();
  const { user, token, logout, _hasHydrated } = useAuthStore();
  
  // Form state
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [patientDni, setPatientDni] = useState('');
  const [patientName, setPatientName] = useState('');
  
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token || user?.role !== 'receptionist') {
      router.push('/receptionist/login');
    }
  }, [_hasHydrated, token, user, router]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    router.push('/');
  };

  if (!_hasHydrated || !user) return null;

  const handleSearchSlots = async () => {
    if (!specialty || !date) {
      setError('Seleccione especialidad y fecha');
      return;
    }
    setError('');
    setMessage('');
    setSelectedSlot(null);
    setLoadingSlots(true);
    
    try {
      const response: any = await fetchApi(`/appointments/available-slots?specialty=${encodeURIComponent(specialty)}&date=${date}`);
      setSlots(response.data || []);
      if (response.data.length === 0) {
        setError('No hay cupos disponibles para esta fecha y especialidad.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar cupos');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !patientDni || !patientName) {
      setError('Complete todos los campos del paciente y seleccione un cupo.');
      return;
    }
    setError('');
    setBooking(true);

    try {
      await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId: patientDni, // Using DNI as patientId for simplicity here
          patientName: patientName,
          doctorId: selectedSlot.doctorId,
          doctorName: selectedSlot.doctorName,
          specialty: selectedSlot.specialty,
          room: selectedSlot.room,
          floor: selectedSlot.floor,
          time: selectedSlot.time,
          date: date,
          status: 'pending',
          isUrgency: false
        })
      });
      setMessage('¡Cita registrada exitosamente!');
      // Reset form
      setPatientDni('');
      setPatientName('');
      setSelectedSlot(null);
      // Refresh slots
      handleSearchSlots();
    } catch (err: any) {
      setError(err.message || 'Error al registrar cita');
    } finally {
      setBooking(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FA] to-[#E0F2F1] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-[#BDE0FE]/30">
          <div>
            <h1 className="text-3xl font-extrabold text-[#003B73]">Módulo de Recepción</h1>
            <p className="text-[#005792] font-medium mt-1">Bienvenido(a), {user.firstName} {user.lastName}</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
          </Button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Search Form */}
          <Card className="md:col-span-4 shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-[#005792]/5 border-b border-[#005792]/10 rounded-t-3xl pb-6">
              <CardTitle className="flex items-center text-[#003B73]">
                <CalendarPlus className="w-6 h-6 mr-3 text-[#0083B0]" />
                Buscar Cupos
              </CardTitle>
              <CardDescription>Busca horarios libres por especialidad y asigne automáticamente un especialista.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="text-[#003B73] font-bold">Especialidad</Label>
                <Select value={specialty} onValueChange={(val) => setSpecialty(val || '')}>
                  <SelectTrigger className="h-14 rounded-2xl border-[#BDE0FE] bg-[#F8FAFC]">
                    <SelectValue placeholder="Seleccione especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Oncología Ginecológica">Oncología Ginecológica</SelectItem>
                    <SelectItem value="Radioterapia">Radioterapia</SelectItem>
                    <SelectItem value="Cardiología">Cardiología</SelectItem>
                    <SelectItem value="Anatomía Patológica">Anatomía Patológica</SelectItem>
                    <SelectItem value="Patología Clínica">Patología Clínica</SelectItem>
                    <SelectItem value="Centro Quirúrgico">Centro Quirúrgico</SelectItem>
                    <SelectItem value="Hospitalización Oncológica">Hospitalización Oncológica</SelectItem>
                    <SelectItem value="Cirugía Oncológica">Cirugía Oncológica</SelectItem>
                    <SelectItem value="Consulta Externa">Consulta Externa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[#003B73] font-bold">Fecha</Label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="h-14 rounded-2xl border-[#BDE0FE] bg-[#F8FAFC]"
                />
              </div>

              <Button 
                onClick={handleSearchSlots}
                disabled={loadingSlots}
                className="w-full h-14 rounded-2xl font-bold bg-gradient-to-r from-[#005792] to-[#0083B0] text-white hover:shadow-lg transition-all"
              >
                {loadingSlots ? 'Buscando...' : 'Buscar Cupos Libres'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Column: Results and Booking */}
          <Card className="md:col-span-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-[#005792]/5 border-b border-[#005792]/10 rounded-t-3xl pb-6">
              <CardTitle className="flex items-center text-[#003B73]">
                <Stethoscope className="w-6 h-6 mr-3 text-[#0083B0]" />
                Resultados y Agendamiento
              </CardTitle>
              <CardDescription>Seleccione un horario y registre los datos del paciente.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              {error && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
              {message && <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-xl border border-green-200">{message}</div>}

              {slots.length > 0 ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-[#003B73] mb-4">Horarios Disponibles (Asignación Automática)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {slots.map((slot, idx) => (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            selectedSlot === slot 
                            ? 'border-[#0083B0] bg-[#0083B0]/10 text-[#003B73]' 
                            : 'border-gray-100 hover:border-[#BDE0FE] bg-white'
                          }`}
                        >
                          <div className="font-bold text-lg">{slot.time}</div>
                          <div className="text-xs text-gray-500 truncate">{slot.doctorName}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {selectedSlot && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#BDE0FE]/50 space-y-6"
                    >
                      <div className="flex items-center text-[#005792]">
                        <UserCheck className="w-5 h-5 mr-2" />
                        <span className="font-bold text-lg">Registrar Paciente para las {selectedSlot.time}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-semibold text-[#003B73]">DNI del Paciente</Label>
                          <Input 
                            value={patientDni} 
                            onChange={(e) => setPatientDni(e.target.value)} 
                            placeholder="Ej: 78451236"
                            className="bg-white border-[#BDE0FE] rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold text-[#003B73]">Nombres Completos</Label>
                          <Input 
                            value={patientName} 
                            onChange={(e) => setPatientName(e.target.value)} 
                            placeholder="Ej: Juan Perez"
                            className="bg-white border-[#BDE0FE] rounded-xl"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleBookAppointment}
                        disabled={booking}
                        className="w-full h-14 rounded-xl font-bold bg-[#005792] hover:bg-[#003B73] text-white"
                      >
                        {booking ? 'Registrando...' : 'Confirmar Cita'}
                      </Button>
                    </motion.div>
                  )}

                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-gray-500">Realice una búsqueda para ver los cupos disponibles.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
