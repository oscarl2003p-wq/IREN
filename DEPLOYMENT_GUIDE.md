# 🚀 Despliegue Rápido a Producción

Tu proyecto está listo para desplegar en Internet. Aquí está la guía paso a paso.

---

## 📋 URLs de Dashboard

- **Vercel**: https://vercel.com/dashboard
- **Railway**: https://railway.app/dashboard

---

## 🎯 Frontend - Vercel

### El proyecto ya está creado en Vercel: `desafio-iren`

Solo necesitas configurar la variable de entorno:

1. **Ve a**: https://vercel.com/oxplz-s-projects/desafio-iren/settings/environment-variables
2. **Haz clic en**: "Add New"
3. **Nombre**: `NEXT_PUBLIC_API_URL`
4. **Valor**: (dejaremos vacío por ahora, actualizaremos después de desplegar el backend)
5. **Selecciona**: Production, Preview, Development
6. **Haz clic en**: "Save"

Después ve a **Deployments** y espera a que termine (o reconstruye manualmente).

---

## 🔧 Backend - Railway

### Paso 1: Crear Proyecto en Railway
1. Ve a https://railway.app/dashboard
2. Haz clic en "+ New Project"
3. Selecciona "Deploy from GitHub Repo"
4. Conecta GitHub y selecciona `oscarl2003p-wq/IREN`
5. Autoriza Railway

### Paso 2: Configurar el Servicio
1. En Railway, haz clic en "Configure"
2. Selecciona "Node" (o déjalo auto-detectar)
3. Click en el proyecto → "Settings"

### Paso 3: Variables de Entorno
En Railway, agrega estas variables en "Variables":
```
NODE_ENV=production
PORT=3001
```

### Paso 4: Build Command
- **Build Command**: `npm run build -w apps/backend`
- **Start Command**: `node apps/backend/dist/main.js`
- **Root Directory**: (dejar vacío)

### Paso 5: Deploy
Haz clic en "Deploy" y espera ~5-10 minutos.

Una vez que termine, Railway te dará una URL como:
```
https://iren-production-xxxx.railway.app
```

---

## 🔗 Conectar Frontend y Backend

Después que Railway termine:

1. **Ve a Vercel Settings** → Environment Variables
2. **Edita** `NEXT_PUBLIC_API_URL`
3. **Valor**: `https://tu-url-railway.railway.app`
4. **Haz clic en**: "Save"
5. **Redeploy** en Vercel

---

## ✅ URLs Finales

Una vez desplegado:

- **Frontend**: https://desafio-iren.vercel.app
- **Backend API**: https://tu-railway-url.railway.app
- **Swagger Docs**: https://tu-railway-url.railway.app/api/docs

---

## 📱 Acceso desde Teléfono

Desde cualquier parte del mundo:
```
https://desafio-iren.vercel.app
```

---

## 💡 Si algo falla

1. **Vercel**: Ve a "Deployments" → haz clic en el último → mira los logs
2. **Railway**: Ve a "Deployments" → haz clic en el último → mira los logs

---

## 🔄 Despliegue Automático

Ahora cada vez que hagas `git push`:
- ✅ Vercel redeploya automáticamente
- ✅ Railway redeploya automáticamente

---

## 📞 Variables de Entorno Producción (si las necesitas)

```env
# Backend
NODE_ENV=production
PORT=3001
JWT_SECRET=tu-secreto-aqui-minimo-32-caracteres
JWT_EXPIRATION=24h
DATABASE_URL=tu-base-datos (si tienes una)

# Frontend
NEXT_PUBLIC_API_URL=https://tu-railway-url.railway.app
```

---

**¡Listo! Tu proyecto estará accesible desde cualquier dispositivo en el mundo! 🌍**
