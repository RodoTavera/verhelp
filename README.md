# VetHelp Cloud

VetHelp Cloud es una SPA multirol para historial clínico digital de mascotas. La interfaz está construida con React + Vite y consume una API Express que centraliza autenticación, fichas, auditoría, verificación de viaje y administración.

## Arquitectura actual

- Frontend SPA con React, Vite, React Router y Tailwind CSS
- Backend API con Node.js + Express
- Persistencia local en `data/db.json`
- Hashing de contraseñas con PBKDF2
- Tokens bearer en memoria para sesión demo

## Rutas principales

- `/`: landing pública
- `/auth`: acceso y registro por rol
- `/dashboard`: panel principal para dueño, familiar y veterinaria
- `/pets`: gestión de fichas, permisos y autorizaciones
- `/records`: historial clínico y auditoría
- `/travel`: verificación sanitaria para aerolíneas
- `/clinics`: directorio de clínicas autorizadas
- `/guides`: biblioteca de cuidado y calculadora nutricional
- `/admin`: panel de administración

## Roles soportados

1. Dueño
- Registro con DNI
- Crea y edita fichas base
- Autoriza veterinarias por RUC
- Comparte visualización con familiares

2. Familiar
- Registro con DNI + DNI del dueño principal
- Consulta mascotas compartidas

3. Veterinaria
- Registro con RUC
- Consulta fichas visibles
- Edita historial cuando existe autorización del dueño

4. Aerolínea
- Login con código de aerolínea
- Verificación de aptitud de viaje por ID de mascota

5. Admin
- Login por correo
- Panel de overview, usuarios y clínicas
- Alta y baja de clínicas desde la web

## Cuentas demo

- Dueño: `44556677` / `demo123`
- Familiar: `77889911` / `demo123`
- Veterinaria: `20123456789` / `demo123`
- Aerolínea: `AERO001` / `air12345`
- Admin: `admin@vethelp.cloud` / `admin123`

## Desarrollo

1. Instalar dependencias

```bash
npm install
```

2. Levantar frontend y backend en desarrollo

```bash
npm run dev
```

Esto inicia Vite en `http://localhost:5173` y la API en `http://localhost:5500`.

3. Si solo necesitas la API

```bash
npm run server
```

## Build

```bash
npm run build
```

## Endpoints clave

- `POST /api/register/owner`
- `POST /api/register/family`
- `POST /api/register/vet`
- `POST /api/login`
- `GET /api/session`
- `GET /api/pets`
- `POST /api/pets`
- `PATCH /api/pets/:petId`
- `POST /api/pets/:petId/authorize-vet`
- `POST /api/pets/:petId/grant-family`
- `GET /api/pets/:petId/records`
- `POST /api/pets/:petId/records`
- `GET /api/airline/verify/:petId`
- `GET /api/clinics`
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/clinics`
- `POST /api/admin/clinics`
- `DELETE /api/admin/clinics/:clinicId`

## Nota de migración

La app ya no usa los HTML/JS multipágina legacy. Esos archivos se eliminaron de la raíz porque interferían con el enrutado de Vite y con React Router.

## Producción futura

1. Migrar a PostgreSQL
2. JWT + refresh tokens + revocación
3. Subida real de archivos clínicos a almacenamiento seguro
4. Integraciones de mapas para geocodificación y directorio
5. Observabilidad y monitoreo de seguridad
