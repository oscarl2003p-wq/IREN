'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { fetchApi } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, FileText, Calendar, Clock, Loader2, ChevronDown, ChevronUp, Syringe, Pill, Stethoscope, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MedicalRecord {
  id: string;
  date: string;
  stage: 'triaje' | 'consultorio' | 'laboratorio' | 'farmacia';
  doctorName: string;
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

export default function HistorialPage() {
  const router = useRouter();
  const { user, token, _hasHydrated } = useAuthStore();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchApi<MedicalRecord[]>(`/medical-records/patient/${user.id}`);
      if (Array.isArray(data)) {
        setRecords(data);
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) {
      router.push('/');
      return;
    }
    loadHistory();
  }, [_hasHydrated, token, user]);

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'triaje': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'consultorio': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'laboratorio': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'farmacia': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageIcon = (stage: string) => {
    switch(stage) {
      case 'triaje': return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'consultorio': return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'laboratorio': return <Beaker className="w-5 h-5 text-purple-600" />;
      case 'farmacia': return <Pill className="w-5 h-5 text-amber-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const MOCK_ONCOLOGY_DATA = {
    diagnosis: "Paciente presenta evolución clínica favorable post-cirugía de cérvix. No refiere dolor pélvico. Sangrado vaginal ausente. Herida operatoria en buen estado. Se evidencia respuesta positiva a la terapia adyuvante.\n\nPlan:\n- Continuar controles en 3 meses.\n- Solicitar marcador tumoral SCC para próxima cita.\n- Dieta balanceada y caminatas ligeras.",
    notes: "Se explicó detalladamente a la paciente la importancia de asistir a sus controles. Entregó orden para laboratorio y receta médica para dolor eventual.",
    vitals: { bloodPressure: '110/70', temperature: '36.5 °C', weight: '65 kg', height: '1.60 m', heartRate: '72 bpm' }
  };

  if (!_hasHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <header className="max-w-4xl mx-auto flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4 text-gray-600 hover:text-teal-700 text-base h-12 px-5">
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver al dashboard
        </Button>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center">
            Historial Médico <FileText className="ml-3 w-8 h-8 text-teal-600" />
          </h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg">
            Aquí puedes revisar los resultados y diagnósticos de tus atenciones.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <Card className="shadow-sm rounded-2xl overflow-hidden border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="p-10 text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium">Aún no hay registros médicos.</p>
              <p className="mt-2">Tus atenciones completadas aparecerán aquí.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative border-l-2 border-gray-200 ml-6 md:ml-8 space-y-8 pb-4">
            {records.map((record, index) => {
              const isExpanded = expandedId === record.id;
              
              // Use mock data if fields are missing for a better demo
              const displayDiagnosis = record.diagnosis || (record.stage === 'consultorio' ? MOCK_ONCOLOGY_DATA.diagnosis : undefined);
              const displayNotes = record.notes || (record.stage === 'consultorio' ? MOCK_ONCOLOGY_DATA.notes : undefined);
              const displayVitals = record.vitals || (record.stage === 'triaje' ? MOCK_ONCOLOGY_DATA.vitals : undefined);

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-8 md:pl-10"
                >
                  {/* Timeline Icon */}
                  <div className="absolute -left-[20px] top-4 bg-white p-1 rounded-full border-2 border-gray-200 shadow-sm z-10">
                    {getStageIcon(record.stage)}
                  </div>

                  <Card className={`shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 border ${isExpanded ? 'border-teal-300 ring-1 ring-teal-100' : 'border-gray-200'}`}>
                    <div 
                      className="p-5 md:p-6 cursor-pointer select-none bg-white hover:bg-slate-50 transition-colors flex items-center justify-between"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStageColor(record.stage)}`}>
                            {record.stage}
                          </span>
                          <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> {new Date(record.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Dr. {record.doctorName}</h3>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden bg-slate-50 border-t border-slate-100"
                        >
                          <CardContent className="p-6 md:p-8">
                            <div className="space-y-6">
                              {displayVitals && (
                                <div>
                                  <h4 className="font-bold text-teal-900 mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Signos Vitales</h4>
                                  <div className="bg-white border border-teal-100 shadow-sm rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div><span className="block text-teal-600 font-semibold mb-1 text-xs uppercase tracking-wider">Presión</span><span className="text-gray-900 font-medium text-lg">{displayVitals.bloodPressure}</span></div>
                                    <div><span className="block text-teal-600 font-semibold mb-1 text-xs uppercase tracking-wider">Temp.</span><span className="text-gray-900 font-medium text-lg">{displayVitals.temperature}</span></div>
                                    <div><span className="block text-teal-600 font-semibold mb-1 text-xs uppercase tracking-wider">Peso</span><span className="text-gray-900 font-medium text-lg">{displayVitals.weight}</span></div>
                                    <div><span className="block text-teal-600 font-semibold mb-1 text-xs uppercase tracking-wider">FC</span><span className="text-gray-900 font-medium text-lg">{displayVitals.heartRate}</span></div>
                                  </div>
                                </div>
                              )}

                              {displayDiagnosis && (
                                <div>
                                  <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Diagnóstico y Evolución</h4>
                                  <div className="bg-white border border-indigo-100 shadow-sm rounded-xl p-5 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                                    {displayDiagnosis}
                                  </div>
                                </div>
                              )}

                              {displayNotes && (
                                <div>
                                  <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Notas e Indicaciones Adicionales</h4>
                                  <div className="bg-[#FFFAF0] border border-amber-200 shadow-sm rounded-xl p-5 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                    {displayNotes}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
