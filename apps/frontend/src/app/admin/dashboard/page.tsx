'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, LogOut, Edit, Trash2, Check, X, CalendarDays, Pill, Bed, QrCode, Menu, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
}

export default function AdminERPDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'citas' | 'farmacia' | 'camas' | 'qr'>('usuarios');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados para CRUD de Usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Paciente');
  const [formStatus, setFormStatus] = useState('Activo');

  // Estados para QR
  const [qrDestination, setQrDestination] = useState('oncologia');
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormRole('Paciente');
    setFormStatus('Activo');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSaveUser = async () => {
    if (!formName.trim()) return;
    const payload = { name: formName, role: formRole, status: formStatus };
    try {
      if (editingId) {
        await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  const generateQR = async () => {
    const destinations: Record<string, { waypointIndex: number; message: string }> = {
      admision: { waypointIndex: 0, message: 'Admisión' },
      triaje: { waypointIndex: 1, message: 'Triaje' },
      oncologia: { waypointIndex: 4, message: 'Consultorio 4 (Oncología)' },
      laboratorio: { waypointIndex: 2, message: 'Laboratorio' },
      farmacia: { waypointIndex: 3, message: 'Farmacia' },
    };

    const target = destinations[qrDestination];
    const payload = JSON.stringify({ location: qrDestination, ...target });
    
    try {
      const url = await QRCode.toDataURL(payload, {
        width: 400,
        margin: 2,
        color: { dark: '#003B73', light: '#ffffff' }
      });
      setQrImage(url);
    } catch (err) {
      console.error(err);
      alert('Error al generar el código QR.');
    }
  };

  // Renderizadores de Pestañas
  const renderTabUsuarios = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#003B73]">Directorio de Usuarios</h2>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} className="bg-[#005792] hover:bg-[#003B73] h-14 px-6 text-lg rounded-xl shadow-md">
            <UserPlus className="w-6 h-6 mr-3" /> Añadir Nuevo
          </Button>
        )}
      </div>

      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {(isAdding || editingId) && (
            <div className="p-6 bg-[#F0F7FA] border-b border-[#BDE0FE] flex flex-wrap gap-6 items-end rounded-t-2xl">
              <div className="flex-1 min-w-[250px]">
                <label className="text-base font-bold text-[#005792] mb-2 block">Nombre Completo del Usuario</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ej. Juan Pérez" className="bg-white h-14 text-lg rounded-xl border-[#BDE0FE]" />
              </div>
              <div className="w-56">
                <label className="text-base font-bold text-[#005792] mb-2 block">Rol Asignado</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full h-14 px-4 rounded-xl border border-[#BDE0FE] bg-white text-lg font-medium text-gray-700">
                  <option value="Paciente">Paciente</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>
              <div className="w-56">
                <label className="text-base font-bold text-[#005792] mb-2 block">Estado</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full h-14 px-4 rounded-xl border border-[#BDE0FE] bg-white text-lg font-medium text-gray-700">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="flex gap-3 w-full sm:w-auto mt-2">
                <Button onClick={handleSaveUser} className="bg-emerald-600 hover:bg-emerald-700 h-14 px-6 text-lg rounded-xl flex-1 sm:flex-none">
                  <Check className="w-6 h-6 mr-2" /> Guardar
                </Button>
                <Button variant="outline" onClick={resetForm} className="bg-white text-red-600 hover:bg-red-50 border-red-200 h-14 px-6 text-lg rounded-xl flex-1 sm:flex-none">
                  <X className="w-6 h-6 mr-2" /> Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b text-base text-[#005792] font-bold">
                  <th className="p-5">Nombre del Usuario</th>
                  <th className="p-5">Rol / Cargo</th>
                  <th className="p-5">Estado</th>
                  <th className="p-5 text-right">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center text-lg text-gray-500 font-medium">Cargando directorio...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-lg text-gray-500 font-medium">No hay usuarios registrados aún.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-5 font-bold text-gray-800 text-lg">{user.name}</td>
                      <td className="p-5">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${user.role === 'Doctor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-[#005792]'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${user.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-3">
                        <Button variant="outline" onClick={() => { setEditingId(user.id); setFormName(user.name); setFormRole(user.role); setFormStatus(user.status); setIsAdding(false); }} className="h-12 w-12 p-0 text-[#005792] border-[#BDE0FE] hover:bg-[#E0F2F1] rounded-xl">
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" onClick={() => handleDeleteUser(user.id)} className="h-12 w-12 p-0 text-red-600 border-red-200 hover:bg-red-50 rounded-xl">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderTabCitas = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-3xl font-bold text-[#003B73] mb-6">Agenda de Citas del Día</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { pac: 'Ana Torres', doc: 'Dra. Elena Rivas', hora: '08:00 AM', esp: 'Oncología Médica', est: 'Atendiendo' },
          { pac: 'Carlos Mendoza', doc: 'Dr. Roberto Sánchez', hora: '09:30 AM', esp: 'Radioterapia', est: 'En Espera' },
          { pac: 'María Lopez', doc: 'Dra. Carmen Paz', hora: '10:00 AM', esp: 'Nutrición', est: 'Programada' },
        ].map((cita, i) => (
          <Card key={i} className="rounded-2xl border border-[#BDE0FE] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-xl font-bold text-gray-800">{cita.pac}</p>
                <p className="text-base text-[#005792] font-semibold mt-1">{cita.doc} • {cita.esp}</p>
                <p className="text-sm text-gray-500 mt-2 flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Hoy, {cita.hora}</p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold ${cita.est === 'Atendiendo' ? 'bg-yellow-100 text-yellow-800' : cita.est === 'En Espera' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-[#005792]'}`}>
                {cita.est}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );

  const renderTabFarmacia = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-3xl font-bold text-[#003B73] mb-6">Inventario de Farmacia</h2>
      <Card className="rounded-2xl overflow-hidden shadow-sm border border-[#BDE0FE]">
        <table className="w-full text-left">
          <thead className="bg-[#F0F7FA]">
            <tr className="text-[#005792] text-lg">
              <th className="p-5 font-bold">Medicamento</th>
              <th className="p-5 font-bold text-center">Stock Actual</th>
              <th className="p-5 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {[
              { nombre: 'Paracetamol 500mg', stock: 1250, estado: 'Óptimo', color: 'text-emerald-700 bg-emerald-100' },
              { nombre: 'Paclitaxel 30mg', stock: 15, estado: 'Crítico', color: 'text-red-700 bg-red-100' },
              { nombre: 'Ondansetrón 8mg', stock: 120, estado: 'Bajo', color: 'text-orange-700 bg-orange-100' },
            ].map((med, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-5 text-lg font-bold text-gray-700 flex items-center"><Pill className="w-5 h-5 mr-3 text-[#005792]" /> {med.nombre}</td>
                <td className="p-5 text-xl font-extrabold text-center text-gray-600">{med.stock}</td>
                <td className="p-5">
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold ${med.color}`}>{med.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </motion.div>
  );

  const renderTabQR = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
      <h2 className="text-3xl font-bold text-[#003B73] mb-2 text-center">Generador de Rutas Interactivas (QR)</h2>
      <p className="text-lg text-gray-500 mb-8 text-center max-w-2xl">
        Genera códigos QR al instante para que los pacientes los escaneen desde la app y reciban una ruta 3D interactiva hacia su destino.
      </p>

      <Card className="w-full max-w-xl rounded-3xl shadow-xl border border-[#BDE0FE] bg-white p-8">
        <div className="space-y-6">
          <div>
            <label className="text-xl font-bold text-[#005792] mb-3 block">Seleccionar Destino del Paciente</label>
            <select 
              value={qrDestination} 
              onChange={(e) => { setQrDestination(e.target.value); setQrImage(null); }} 
              className="w-full h-16 px-5 rounded-2xl border-2 border-[#BDE0FE] bg-[#F8FAFC] text-xl font-bold text-gray-700 focus:border-[#0083B0] outline-none transition-colors"
            >
              <option value="admision">Admisión</option>
              <option value="triaje">Sala de Triaje</option>
              <option value="oncologia">Consultorio de Oncología Médica</option>
              <option value="laboratorio">Laboratorio Clínico</option>
              <option value="farmacia">Farmacia Central</option>
            </select>
          </div>
          
          <Button onClick={generateQR} className="w-full h-16 bg-gradient-to-r from-[#005792] to-[#0083B0] hover:from-[#003B73] hover:to-[#005792] text-white text-xl font-bold rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
            <QrCode className="w-6 h-6 mr-3" /> Generar Código QR
          </Button>

          <AnimatePresence>
            {qrImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="mt-8 flex flex-col items-center bg-[#F0F7FA] p-6 rounded-2xl border border-[#BDE0FE]"
              >
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <img src={qrImage} alt="QR Code generado" className="w-64 h-64" />
                </div>
                <p className="text-[#005792] font-bold text-lg text-center">
                  Código Listo. <br/>Muestra esta pantalla al paciente o imprímela.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-gradient-to-b from-[#003B73] to-[#005792] text-white shadow-2xl z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col rounded-r-3xl lg:rounded-none`}>
        <div className="p-8 flex flex-col items-center border-b border-white/10">
          <div className="bg-white/10 p-4 rounded-2xl mb-4 backdrop-blur-md">
            <LayoutDashboard className="w-12 h-12 text-[#BDE0FE]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide text-center">IREN ERP</h1>
          <p className="text-[#BDE0FE] font-medium text-sm mt-1 text-center">Portal de Gestión Hospitalaria</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {[
            { id: 'usuarios', icon: Users, label: 'Pacientes y Personal' },
            { id: 'citas', icon: CalendarDays, label: 'Gestión de Citas' },
            { id: 'farmacia', icon: Pill, label: 'Inventario Farmacia' },
            { id: 'camas', icon: Bed, label: 'Gestión de Camas' },
            { id: 'qr', icon: QrCode, label: 'Generador de QR Rutas' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center px-5 py-4 rounded-2xl text-lg font-bold transition-all duration-200 ${
                  isActive 
                  ? 'bg-white text-[#005792] shadow-lg scale-105' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-6 h-6 mr-4 ${isActive ? 'text-[#005792]' : 'text-[#BDE0FE]'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <Button 
            onClick={() => router.push('/admin/login')} 
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-14 text-lg rounded-xl shadow-md border-0"
          >
            <LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm h-20 flex items-center justify-between px-6 z-30">
          <div className="flex items-center text-[#003B73] font-bold text-xl">
            <LayoutDashboard className="w-6 h-6 mr-2" /> IREN ERP
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-[#003B73] bg-[#F0F7FA] rounded-xl">
            <Menu className="w-8 h-8" />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#FDFBF7]">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'usuarios' && renderTabUsuarios()}
            {activeTab === 'citas' && renderTabCitas()}
            {activeTab === 'farmacia' && renderTabFarmacia()}
            {activeTab === 'qr' && renderTabQR()}
            {activeTab === 'camas' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Bed className="w-24 h-24 text-[#BDE0FE] mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-[#005792]">Gestión de Camas</h2>
                <p className="text-xl text-gray-500 mt-4">Módulo en etapa de integración. Muestra visual del mapeo de camas del hospital IREN.</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
