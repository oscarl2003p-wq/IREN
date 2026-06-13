// Pasos del proceso clínico por especialidad — basados en los flujogramas reales de IREN
export const SPECIALTY_ROUTE_STEPS: Record<string, { name: string; description: string }[]> = {
  'Anatomía Patológica': [
    { name: 'Admisión / Recepción de Solicitud', description: 'Presentación de solicitud citológica e histológica con voucher de conformidad.' },
    { name: 'Verificación de Conformidad', description: 'Revisión de la solicitud de trabajo. Si no está conforme, se solicitarán correcciones.' },
    { name: 'Registro y Codificación', description: 'Recepción, registro, codificación y distribución de muestras según área correspondiente.' },
    { name: 'Procesamiento de Tejidos', description: 'Inclusión en parafina, microtomía, tinción de rutina o especial y montaje de láminas.' },
    { name: 'Área de Microscopía', description: 'Interpretación y diagnóstico por médico patólogo especialista.' },
    { name: 'Área de Digitación', description: 'Ordenamiento, verificación y digitación de resultados.' },
    { name: 'Entrega de Resultados', description: 'Entrega de resultados en archivos previa firma del registro de conformidad.' },
  ],
  'Patología Clínica': [
    { name: 'Admisión de Laboratorio', description: 'Solicitar DNI, verificar tipo de financiamiento y emitir cita. Ingresar solicitud a LabCore.' },
    { name: 'Toma de Muestra', description: 'Verificar condiciones pre-analíticas. Si cumple: extracción y transporte al área de clasificación.' },
    { name: 'Clasificación y Distribución', description: 'Verificación, preparación y clasificación de muestras. Entrega al área de Analítica.' },
    { name: 'Análisis de Laboratorio', description: 'Procesamiento según tipo de análisis y prioridad. Registro de muestra y elaboración de reporte.' },
    { name: 'Validación de Resultados', description: 'Interpretación por médico patólogo clínico / médico hematólogo. Validación de valores discordantes.' },
    { name: 'Entrega y Trámite', description: 'Resultado en físico y trámite documentario. Si aplica, registro en HC digital.' },
  ],
  'Centro Quirúrgico': [
    { name: 'Recepción / Admisión', description: 'Verificación de identidad, documentación e historial preoperatorio en Centro Quirúrgico.' },
    { name: 'Sala de Inducción Anestésica', description: 'Preparación y aplicación de anestesia por equipo especializado.' },
    { name: 'Sala de Operaciones', description: 'Procedimiento quirúrgico en Sala de Operaciones I, II, III o IV según programación.' },
    { name: 'Recuperación Post-Anestésica', description: 'Monitoreo y control continuo en Unidad de Recuperación Post-Anestésica (URPA).' },
    { name: 'Recuperación y Alta', description: 'Evaluación final por médico tratante y proceso de alta médica o retorno a sala.' },
  ],
  'Hospitalización Oncológica': [
    { name: 'Consulta Médica Especializada', description: 'Evaluación por médico especialista. Determinación de necesidad de hospitalización.' },
    { name: 'Módulo I — Pre-Hospitalización', description: 'Verificación de exámenes preoperatorios, recojo de medicamentos y reporte de enfermería.' },
    { name: 'Coordinación con Admisión', description: 'Coordinación de cama disponible, consentimiento informado y trámites de ingreso.' },
    { name: 'Hospitalización — Medicina Oncológica', description: 'Ingreso a sala de Medicina Oncológica para tratamiento integral.' },
  ],
  'Cirugía Oncológica': [
    { name: 'Consulta Pre-Quirúrgica', description: 'Evaluación y orden de hospitalización. Exámenes auxiliares, riesgo cardiovascular y anestesiológico.' },
    { name: 'Módulo I — Pre-Operatorio', description: 'Verificación de exámenes completos, medicamentos y registro de enfermería.' },
    { name: 'Inducción Anestésica', description: 'Preparación y aplicación de anestesia en sala de inducción.' },
    { name: 'Sala de Operaciones', description: 'Procedimiento quirúrgico oncológico en sala asignada del Centro Quirúrgico.' },
    { name: 'Recuperación Post-Anestésica', description: 'Monitoreo en URPA y evaluación de alta a sala de hospitalización.' },
  ],
  'Oncología Ginecológica': [
    { name: 'Admisión', description: 'Verificación de identidad y pase de entrada al consultorio.' },
    { name: 'Triaje', description: 'Evaluación de signos vitales (PA, temperatura, peso) y clasificación de riesgo oncológico.' },
    { name: 'Consulta Oncológica', description: 'Atención por médico oncólogo ginecólogo. Evaluación clínica, diagnóstico y plan de tratamiento.' },
    { name: 'Indicaciones y Derivación', description: 'Entrega de indicaciones médicas, receta y derivación si corresponde a otro servicio.' },
  ],
  'Radioterapia': [
    { name: 'Admisión', description: 'Verificación de identidad y revisión del plan de radioterapia vigente.' },
    { name: 'Verificación del Plan', description: 'Control de posicionamiento y verificación técnica del plan de irradiación.' },
    { name: 'Sesión de Radioterapia', description: 'Aplicación de la sesión de radioterapia en el equipo asignado (Linac / Braquiterapia).' },
    { name: 'Control Post-Sesión', description: 'Evaluación de tolerancia al tratamiento y registro de la sesión en HC.' },
  ],
  'Cardiología': [
    { name: 'Admisión', description: 'Verificación de identidad y pase de entrada.' },
    { name: 'Triaje Cardiovascular', description: 'Toma de signos vitales, ECG básico y evaluación de riesgo cardíaco.' },
    { name: 'Consulta Cardiológica', description: 'Evaluación por médico cardiólogo. Revisión de estudios (ECO, Holter) y plan terapéutico.' },
    { name: 'Indicaciones', description: 'Indicaciones médicas, receta y programación de controles o estudios complementarios.' },
  ],
  'Consulta Externa': [
    { name: 'Inicio', description: 'El usuario presenta su consulta en IREN Centro, personalmente o virtualmente.' },
    { name: 'Atención PAUS', description: 'El personal de la PAUS atiende la consulta y evalúa si hay respuesta inmediata.' },
    { name: 'Atención por UPSS', description: 'Si no hay respuesta inmediata: el personal de la UPSS u oficina administrativa recibe y revisa la solicitud.' },
    { name: 'Respuesta al Usuario', description: 'El usuario recibe respuesta en el plazo establecido (máximo 02 días hábiles).' },
  ],
};

// Fallback para especialidades no mapeadas
export const DEFAULT_STEPS = [
  { name: 'Admisión', description: 'Verificación de identidad y pase de entrada.' },
  { name: 'Triaje', description: 'Evaluación inicial y clasificación del paciente.' },
  { name: 'Consulta con Especialista', description: 'Atención por médico especialista en consultorio asignado.' },
  { name: 'Indicaciones / Resultados', description: 'Entrega de indicaciones médicas o resultados de la consulta.' },
];
