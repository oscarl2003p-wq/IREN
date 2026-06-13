# Ruta Inteligente de Atención Médica - IREN

Plataforma web hospitalaria diseñada para el Instituto Regional de Enfermedades Neoplásicas (IREN), que permite a los pacientes visualizar su ruta de atención en tiempo real, su próxima cita, y un mapa interactivo para guiarse dentro del hospital.

## 🚀 Tecnologías

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI, Zustand, React Query, Framer Motion.
* **Backend**: NestJS, TypeScript, Swagger (OpenAPI), Clean Architecture (Hexagonal).
* **Testing**: Jest (Unit testing), Playwright (E2E).

## 📂 Estructura del Monorepo

Este proyecto utiliza NPM Workspaces:
* `/apps/frontend`: Aplicación web Next.js
* `/apps/backend`: API NestJS (Puerto 3001)
* `/packages/shared-types`: Interfaces DTO compartidas.

## 🛠 Instalación y Ejecución

1. Instalar las dependencias en la raíz del proyecto:
```bash
npm install
```

2. Iniciar ambas aplicaciones (Frontend y Backend) simultáneamente:
```bash
npm run dev
```

El Frontend estará disponible en `http://localhost:3000` y el Backend API en `http://localhost:3001`.

## 📖 Documentación de la API (Swagger)

Una vez que el backend esté corriendo, accede a:
`http://localhost:3001/api/docs`

## 🧪 Pruebas

Para ejecutar las pruebas unitarias del backend:
```bash
cd apps/backend
npm run test
```

## 🔐 Simulación MVP (Sin Base de Datos)
Por el momento, los repositorios están inyectados en memoria utilizando el patrón "Fake Repository" (`FakePatientRepository`, `FakeAppointmentRepository`, `FakeRouteRepository`). 
Puedes usar el DNI `78451236` para iniciar sesión y visualizar el flujo completo.

## 📈 Preparado para Escalar
La arquitectura backend está diseñada con Ports & Adapters, lo que significa que migrar estos Fake Repositories a PostgreSQL o MongoDB requerirá simplemente crear nuevos adaptadores que implementen el `RepositoryPort`, sin tener que modificar la lógica de negocio principal.
