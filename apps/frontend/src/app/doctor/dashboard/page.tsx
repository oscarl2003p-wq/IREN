'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { fetchApi } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, UserCheck, UserX, Share2, Clock, MapPin,
  Stethoscope, CalendarDays, Copy, CheckCircle2, X, Loader2, FileText, Activity, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ONCOLOGY_TAGS = {
  tipoConsulta: ['Primera Vez', 'Control', 'Resultados', 'Post-Op'],
  estado: ['Ambulatorio', 'Hospitalizado', 'Emergencia'],
  ecog: ['0 (Activo)', '1 (Restringido)', '2 (Cama <50%)', '3 (Cama >50%)', '4 (Postrado)'],
  dolor: ['Sin Dolor', 'Leve (1-3)', 'Moderado (4-7)', 'Severo (8-10)'],
  intencion: ['Curativa', 'Paliativa', 'Neoadyuvante', 'Adyuvante'],
};

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  room: string;
  floor: string;
  time: string;
  date: string;
  status: string;
  currentStepIndex?: number;
}

interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  stage: 'triaje' | 'consultorio' | 'laboratorio' | 'farmacia';
  diagnosis?: string;
  notes: string;
  vitals?: {
    bloodPressure: string;
    temperature: string;
    weight: string;
    height: string;
    heartRate: string;
  };
  createdAt: string;
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const token = useAuthStore((s) => s.token);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  const [activeTab, setActiveTab] = useState<'agenda' | 'historial'>('agenda');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState<Appointment | null>(null);
  
  // Diagnosis Modal State
  const [diagnosisModal, setDiagnosisModal] = useState<Appointment | null>(null);
  const [diagnosisForm, setDiagnosisForm] = useState({
    stage: 'consultorio' as 'triaje' | 'consultorio' | 'laboratorio' | 'farmacia',
    diagnosis: '',
    treatment: '',
    notes: '',
    vitals: { bloodPressure: '', temperature: '', weight: '', height: '', heartRate: '' }
  });
  
  const [smartTags, setSmartTags] = useState<Record<string, string>>({
    tipoConsulta: '',
    estado: '',
    ecog: '',
    dolor: '',
    intencion: '',
  });

  const [savingDiagnosis, setSavingDiagnosis] = useState(false);

  // Referral Modal State
  const [referralModal, setReferralModal] = useState<Appointment | null>(null);
  const [referralSpecialty, setReferralSpecialty] = useState('');
  const [referralDate, setReferralDate] = useState('');
  const [referralSlots, setReferralSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [savingReferral, setSavingReferral] = useState(false);

  const [copied, setCopied] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user || user.role !== 'doctor') {
      router.push('/doctor/login');
      return;
    }
    loadData();
  }, [_hasHydrated, user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Load appointments
      const apptData = await fetchApi<{ success: boolean; data: Appointment[] }>(`/appointments/doctor/${user.id}`);
      if (apptData.success) setAppointments(apptData.data);
      
      // Load medical records
      const recordData = await fetchApi<MedicalRecord[]>(`/medical-records/doctor/${user.id}`);
      if (Array.isArray(recordData)) setMedicalRecords(recordData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedTreatment, setSelectedTreatment] = useState<'Radioterapia' | 'Cirugía Oncológica' | null>(null);

  const updateStatus = async (id: string, status: 'arrived' | 'no_show') => {
    setUpdatingId(id);
    try {
      const data = await fetchApi<{ success: boolean; data: Appointment }>(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (data.success) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const advanceStep = async (id: string) => {
    setUpdatingId(id);
    try {
      await fetchApi(`/appointments/${id}/advance-step`, { method: 'PATCH' });
      loadData();
    } catch (err) {
      console.error('Error avanzando paso:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const submitDiagnosis = async () => {
    if (!diagnosisModal || !user) return;
    setSavingDiagnosis(true);
    try {
      const recordBase = {
        appointmentId: diagnosisModal.id,
        patientId: diagnosisModal.patientId,
        doctorId: user.id,
        doctorName: `${user.firstName} ${user.lastName}`,
        date: new Date().toISOString().split('T')[0],
        stage: diagnosisForm.stage,
        diagnosis: diagnosisForm.diagnosis,
        notes: diagnosisForm.notes || 'Sin notas adicionales',
        vitals: diagnosisForm.vitals,
      };

      if (user.specialty === 'Oncología Ginecológica' && diagnosisModal.currentStepIndex === 3 && selectedTreatment) {
        // Save medical record first if there is content to register
        if (diagnosisForm.notes || diagnosisForm.diagnosis || diagnosisForm.vitals.bloodPressure) {
          await fetchApi('/medical-records', {
            method: 'POST',
            body: JSON.stringify({ ...recordBase, treatment: selectedTreatment }),
          });
        }
        await fetchApi(`/appointments/${diagnosisModal.id}/derive-treatment`, {
          method: 'POST',
          body: JSON.stringify({ treatment: selectedTreatment }),
        });
      } else {
        await fetchApi('/medical-records', {
          method: 'POST',
          body: JSON.stringify(recordBase),
        });
        await fetchApi(`/appointments/${diagnosisModal.id}/advance-step`, { method: 'PATCH' });
      }
      setDiagnosisModal(null);
      setDiagnosisForm({ diagnosis: '', treatment: '', notes: '', stage: 'triaje', vitals: { bloodPressure: '', temperature: '', weight: '', height: '', heartRate: '' } });
      setSmartTags({ tipoConsulta: '', estado: '', ecog: '', dolor: '', intencion: '' });
      setSelectedTreatment(null);
      await loadData();
    } catch (err: any) {
      console.error('Error guardando:', err);
      alert(`Error al guardar: ${err.message || 'Error desconocido'}`);
    } finally {
      setSavingDiagnosis(false);
    }
  };

  const handleSearchSlots = async () => {
    if (!referralSpecialty || !referralDate) {
      setReferralError('Seleccione especialidad y fecha');
      return;
    }
    setReferralError('');
    setLoadingSlots(true);
    
    try {
      const response: any = await fetchApi(`/appointments/available-slots?specialty=${encodeURIComponent(referralSpecialty)}&date=${referralDate}`);
      setReferralSlots(response.data || []);
      if (response.data.length === 0) {
        setReferralError('No hay cupos disponibles para esta fecha y especialidad.');
      }
    } catch (err: any) {
      setReferralError(err.message || 'Error al buscar cupos');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookReferral = async (slot: any) => {
    if (!referralModal) return;
    setSavingReferral(true);
    setReferralError('');

    try {
      await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId: referralModal.patientId,
          patientName: referralModal.patientName,
          doctorId: slot.doctorId,
          doctorName: slot.doctorName,
          specialty: slot.specialty,
          room: slot.room,
          floor: slot.floor,
          time: slot.time,
          date: referralDate,
          status: 'pending',
          isUrgency: false
        })
      });
      // Cerrar modal de referencia
      setReferralModal(null);
      setReferralSlots([]);
      setReferralSpecialty('');
      setReferralDate('');
      // Show success logic or just reload
      loadData();
    } catch (err: any) {
      setReferralError(err.message || 'Error al registrar la cita referida');
    } finally {
      setSavingReferral(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/doctor/login');
  };

  const generateReport = () => {
    const parts = [];
    if (smartTags.tipoConsulta) parts.push(`Paciente acude a consulta de ${smartTags.tipoConsulta.toLowerCase()}.`);
    if (smartTags.estado) parts.push(`Condición: Paciente ${smartTags.estado.toLowerCase()}.`);
    if (smartTags.ecog) parts.push(`Estado funcional: ECOG ${smartTags.ecog}.`);
    if (smartTags.dolor) parts.push(`Refiere dolor ${smartTags.dolor.toLowerCase()}.`);
    if (smartTags.intencion) parts.push(`Intención de tratamiento: ${smartTags.intencion.toLowerCase()}.`);
    
    let report = parts.join(' ');
    if (report.length > 0) {
      setDiagnosisForm(prev => ({
        ...prev,
        diagnosis: (report + '\n\n' + prev.diagnosis).trim(),
      }));
    }
  };

  const statusLabel = (s: string) => {
    const map: Record<string, { text: string; color: string; bg: string }> = {
      pending: { text: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
      arrived: { text: '✓ Llegó', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
      no_show: { text: '✗ No se presentó', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
      completed: { text: 'Completado', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    };
    return map[s] || map.pending;
  };

  if (!_hasHydrated || !user) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Stethoscope size={28} className="text-blue-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Portal Médico IREN</h1>
              <p className="text-slate-400 text-sm">
                Dr(a). {user.firstName} {user.lastName} — {user.specialty}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-800">
            <LogOut className="mr-2 h-5 w-5" /> Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex space-x-4 border-b border-slate-200">
          <button 
            className={`pb-3 px-4 text-lg font-semibold transition-colors ${activeTab === 'agenda' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('agenda')}
          >
            Agenda del Día
          </button>
          <button 
            className={`pb-3 px-4 text-lg font-semibold transition-colors ${activeTab === 'historial' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('historial')}
          >
            Historial de Atenciones
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          </div>
        ) : activeTab === 'agenda' ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <CalendarDays size={28} className="text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Agenda</h2>
                <p className="text-slate-500 text-base">
                  {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            {appointments.length === 0 ? (
              <Card className="text-center py-16 text-slate-400">
                <CardContent><p className="text-lg">No tiene citas programadas para hoy.</p></CardContent>
              </Card>
            ) : (
              <div className="grid gap-5">
                {appointments.map((appt, i) => {
                  const st = statusLabel(appt.status);
                  return (
                    <motion.div key={appt.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="bg-slate-900 text-white p-6 flex flex-col items-center justify-center md:w-32 rounded-t-xl md:rounded-t-none md:rounded-l-xl">
                              <Clock size={22} className="mb-1 text-blue-300" />
                              <span className="text-2xl font-bold">{appt.time}</span>
                            </div>
                            <div className="flex-1 p-5">
                              <div className="flex items-start justify-between flex-wrap gap-3">
                                <div>
                                  <h3 className="text-lg font-bold text-slate-800">{appt.patientName || `Paciente ${appt.patientId}`}</h3>
                                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14} />{appt.room} — {appt.floor}</p>
                                  <p className="text-xs text-slate-400 mt-1">Cita #{appt.id} | Paso actual: {appt.currentStepIndex !== undefined ? appt.currentStepIndex + 1 : 1}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color}`}>{st.text}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
                                {appt.status === 'pending' && (
                                  <>
                                    <Button size="sm" onClick={() => updateStatus(appt.id, 'arrived')} disabled={updatingId === appt.id} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 h-10 text-sm">
                                      {updatingId === appt.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />} Llegó
                                    </Button>
                                    <Button size="sm" onClick={() => updateStatus(appt.id, 'no_show')} disabled={updatingId === appt.id} className="bg-red-600 hover:bg-red-700 text-white px-5 h-10 text-sm">
                                      {updatingId === appt.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserX className="h-4 w-4 mr-1" />} No Llegó
                                    </Button>
                                  </>
                                )}
                                {(appt.status === 'arrived' || appt.status === 'in_progress') && (
                                  <Button size="sm" onClick={() => advanceStep(appt.id)} disabled={updatingId === appt.id} className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-10 text-sm">
                                    {updatingId === appt.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />} Avanzar Paso
                                  </Button>
                                )}
                                {(appt.status === 'arrived' || appt.status === 'in_progress' || appt.status === 'completed') && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setDiagnosisModal(appt);
                                      let defaultStage: 'triaje' | 'consultorio' | 'laboratorio' | 'farmacia' = 'consultorio';
                                      if (appt.currentStepIndex === 1) {
                                        defaultStage = 'triaje';
                                      } else if (appt.currentStepIndex === 2 || appt.currentStepIndex === 3) {
                                        defaultStage = 'consultorio';
                                      }
                                      setDiagnosisForm(prev => ({ ...prev, stage: defaultStage }));
                                    }} 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 h-10 text-sm"
                                  >
                                    <FileText className="h-4 w-4 mr-1" /> Registrar Diagnóstico
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => setShareModal(appt)} className="px-5 h-10 text-sm border-slate-300 text-slate-700">
                                  <Share2 className="h-4 w-4 mr-1" /> Compartir Info
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setReferralModal(appt)} className="px-5 h-10 text-sm border-amber-300 text-amber-700 hover:bg-amber-50">
                                  <CalendarDays className="h-4 w-4 mr-1" /> Derivar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <Activity size={28} className="text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Historial de Atenciones</h2>
                <p className="text-slate-500 text-base">Registros médicos guardados por usted.</p>
              </div>
            </div>
            {medicalRecords.length === 0 ? (
              <Card className="text-center py-16 text-slate-400">
                <CardContent><p className="text-lg">No hay registros médicos en el historial.</p></CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {medicalRecords.map((record) => (
                  <Card key={record.id} className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-indigo-500" />
                          Paciente ID: {record.patientId}
                        </CardTitle>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded capitalize font-semibold">{record.stage}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{new Date(record.createdAt).toLocaleString()}</p>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm text-slate-700">
                      {record.diagnosis && (
                        <div className="mb-3">
                          <strong className="block text-slate-900 mb-1">Diagnóstico:</strong>
                          <p className="bg-slate-50 p-3 rounded border">{record.diagnosis}</p>
                        </div>
                      )}
                      <div>
                        <strong className="block text-slate-900 mb-1">Notas:</strong>
                        <p className="bg-slate-50 p-3 rounded border whitespace-pre-wrap">{record.notes}</p>
                      </div>
                      {record.vitals && (
                        <div className="mt-3 bg-emerald-50 p-3 rounded border border-emerald-100 grid grid-cols-2 gap-2 text-xs">
                          <div><strong>PA:</strong> {record.vitals.bloodPressure}</div>
                          <div><strong>Temp:</strong> {record.vitals.temperature}</div>
                          <div><strong>Peso:</strong> {record.vitals.weight}</div>
                          <div><strong>FC:</strong> {record.vitals.heartRate}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Diagnóstico */}
      <AnimatePresence>
        {diagnosisModal && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="bg-indigo-600 text-white p-5 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-lg">Registrar Atención</h3>
                <button onClick={() => setDiagnosisModal(null)} className="text-indigo-200 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-5">
                <div className="bg-indigo-50 text-indigo-900 p-3 rounded-lg text-sm border border-indigo-100 font-medium">
                  Paciente: {diagnosisModal.patientName || `ID: ${diagnosisModal.patientId}`} | Cita #{diagnosisModal.id}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Etapa de la Atención</label>
                  <select 
                    value={diagnosisForm.stage} 
                    onChange={(e) => setDiagnosisForm({...diagnosisForm, stage: e.target.value as any})}
                    className="w-full p-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="triaje">Triaje</option>
                    <option value="consultorio">Consultorio Médico</option>
                    <option value="laboratorio">Laboratorio</option>
                    <option value="farmacia">Farmacia</option>
                  </select>
                </div>

                {diagnosisForm.stage === 'triaje' && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div><label className="text-xs font-semibold">Presión Arterial</label><input value={diagnosisForm.vitals.bloodPressure} onChange={e=>setDiagnosisForm({...diagnosisForm, vitals:{...diagnosisForm.vitals, bloodPressure:e.target.value}})} className="w-full p-2 border rounded mt-1" placeholder="120/80" /></div>
                    <div><label className="text-xs font-semibold">Temperatura</label><input value={diagnosisForm.vitals.temperature} onChange={e=>setDiagnosisForm({...diagnosisForm, vitals:{...diagnosisForm.vitals, temperature:e.target.value}})} className="w-full p-2 border rounded mt-1" placeholder="37.0 °C" /></div>
                    <div><label className="text-xs font-semibold">Peso</label><input value={diagnosisForm.vitals.weight} onChange={e=>setDiagnosisForm({...diagnosisForm, vitals:{...diagnosisForm.vitals, weight:e.target.value}})} className="w-full p-2 border rounded mt-1" placeholder="70 kg" /></div>
                    <div><label className="text-xs font-semibold">Frecuencia Cardíaca</label><input value={diagnosisForm.vitals.heartRate} onChange={e=>setDiagnosisForm({...diagnosisForm, vitals:{...diagnosisForm.vitals, heartRate:e.target.value}})} className="w-full p-2 border rounded mt-1" placeholder="80 bpm" /></div>
                  </div>
                )}

                {(diagnosisForm.stage === 'consultorio' || diagnosisForm.stage === 'laboratorio') && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">Generación Rápida de Informe Oncológico</h4>
                        <Button type="button" size="sm" onClick={generateReport} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 h-8">
                          <Activity className="w-4 h-4 mr-2" /> Auto-completar
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries({
                          'Tipo de Consulta': 'tipoConsulta',
                          'Estado': 'estado',
                          'Funcionalidad': 'ecog',
                          'Dolor': 'dolor',
                          'Intención': 'intencion'
                        }).map(([label, key]) => (
                          <div key={key}>
                            <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">{label}</label>
                            <div className="flex flex-wrap gap-2">
                              {ONCOLOGY_TAGS[key as keyof typeof ONCOLOGY_TAGS].map(tag => {
                                const isSelected = smartTags[key] === tag;
                                return (
                                  <button
                                    key={tag}
                                    onClick={() => setSmartTags(prev => ({...prev, [key]: isSelected ? '' : tag}))}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                                  >
                                    {tag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-semibold text-slate-700">Diagnóstico / Resultados (Editable)</label>
                      <textarea 
                        value={diagnosisForm.diagnosis} 
                        onChange={e=>setDiagnosisForm({...diagnosisForm, diagnosis: e.target.value})} 
                        className="w-full p-3 rounded-lg border border-slate-300 h-28 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="El texto autogenerado aparecerá aquí. Puede ingresar el diagnóstico principal manualmente..."
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Notas Adicionales</label>
                  <textarea 
                    value={diagnosisForm.notes} 
                    onChange={e=>setDiagnosisForm({...diagnosisForm, notes: e.target.value})} 
                    className="w-full p-3 rounded-lg border border-slate-300 h-32"
                    placeholder="Escriba indicaciones, recetas o notas de la visita..."
                  />
                </div>

                {user?.specialty === 'Oncología Ginecológica' && diagnosisModal?.currentStepIndex === 3 && (
                  <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
                    <h4 className="text-sm font-bold text-teal-800">Determinación de Tratamiento (Genera Ruta)</h4>
                    <p className="text-xs text-teal-600 mb-3">Seleccione la ruta de tratamiento para programar automáticamente los pasos siguientes del paciente.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        type="button" 
                        onClick={() => setSelectedTreatment('Radioterapia')}
                        variant={selectedTreatment === 'Radioterapia' ? 'default' : 'outline'}
                        className={selectedTreatment === 'Radioterapia' ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'border-teal-300 text-teal-700 hover:bg-teal-100'}
                      >
                        Radioterapia
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setSelectedTreatment('Cirugía Oncológica')}
                        variant={selectedTreatment === 'Cirugía Oncológica' ? 'default' : 'outline'}
                        className={selectedTreatment === 'Cirugía Oncológica' ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'border-teal-300 text-teal-700 hover:bg-teal-100'}
                      >
                        Cirugía Oncológica
                      </Button>
                    </div>
                  </div>
                )}

              </div>
              <div className="p-5 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={() => setDiagnosisModal(null)}>Cancelar</Button>
                <Button 
                  onClick={submitDiagnosis} 
                  disabled={
                    savingDiagnosis || 
                    (!diagnosisForm.notes && user?.specialty !== 'Oncología Ginecológica') || 
                    (user?.specialty === 'Oncología Ginecológica' && diagnosisModal?.currentStepIndex === 3 && !selectedTreatment)
                  } 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {savingDiagnosis ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar y Finalizar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Derivación */}
      <AnimatePresence>
        {referralModal && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="bg-amber-600 text-white p-5 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-lg flex items-center"><CalendarDays className="mr-2" /> Derivar Paciente</h3>
                <button onClick={() => { setReferralModal(null); setReferralSlots([]); }} className="text-amber-200 hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-5 max-h-[70vh]">
                <div className="bg-amber-50 text-amber-900 p-3 rounded-lg text-sm border border-amber-100 font-medium">
                  Paciente: {referralModal.patientName || `ID: ${referralModal.patientId}`}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[#003B73] font-bold">Especialidad a derivar</Label>
                    <Select value={referralSpecialty} onValueChange={(val) => setReferralSpecialty(val || '')}>
                      <SelectTrigger className="h-12 border-slate-300">
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
                      value={referralDate} 
                      onChange={(e) => setReferralDate(e.target.value)} 
                      className="h-12 border-slate-300"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSearchSlots}
                  disabled={loadingSlots}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-12"
                >
                  {loadingSlots ? 'Buscando...' : 'Buscar Horarios Disponibles'}
                </Button>

                {referralError && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                    {referralError}
                  </div>
                )}

                {referralSlots.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-bold text-slate-800 mb-3">Horarios Libres Encontrados</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {referralSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleBookReferral(slot)}
                          disabled={savingReferral}
                          className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all text-left group"
                        >
                          <div className="font-bold text-lg text-slate-800 group-hover:text-amber-700">{slot.time}</div>
                          <div className="text-xs text-slate-500 truncate">{slot.doctorName}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Compartir */}
      <AnimatePresence>
        {shareModal && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShareModal(null)}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
                <h3 className="font-bold text-lg">Información del Paciente</h3>
                <button onClick={() => setShareModal(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2 font-mono">
                  <p><strong>Paciente:</strong> {shareModal.patientName || 'N/A'}</p>
                  <p><strong>Cita:</strong> #{shareModal.id}</p>
                  <p><strong>Especialidad:</strong> {shareModal.specialty}</p>
                  <p><strong>Consultorio:</strong> {shareModal.room}</p>
                </div>
                <Button className="w-full bg-blue-600 text-white h-12" onClick={() => handleCopy(`Cita #${shareModal.id}`)}>
                  {copied ? <span>¡Copiado!</span> : <span>Copiar Información</span>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
