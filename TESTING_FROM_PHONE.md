# 📱 Guía de Prueba desde Teléfono

## Opción 1: Red Local (Recomendado para desarrollo rápido)

### Windows:
```bash
# Ejecuta el script para detectar IP local
.\setup-local-network.bat

# Luego ejecuta
npm run dev
```

### Mac/Linux:
```bash
# Ejecuta el script
bash setup-local-network.sh

# Luego ejecuta
npm run dev
```

### Desde el teléfono:
1. **Conecta el teléfono a la misma WiFi que tu PC**
2. Abre el navegador en tu teléfono
3. Ve a: `http://[TU_IP_LOCAL]:3000`
   - Ejemplo: `http://192.168.1.100:3000`

---

## Opción 2: Túnel con ngrok (Internet público)

Si quieres compartir con alguien fuera de tu red:

```bash
# Instalar ngrok
npm install -g ngrok

# En otra terminal, ejecutar
ngrok http 3000

# ngrok te dará una URL pública: https://xyz.ngrok.io
# Comparte esa URL en tu teléfono
```

---

## Opción 3: Despliegue a Vercel/Railway (Producción)

Para acceso permanente desde cualquier lugar:
```bash
# Ver guía de despliegue en README.md
```

---

## ⚡ Pasos rápidos:

1. **En tu PC, en la carpeta del proyecto:**
   ```bash
   npm install  # Si aún no has instalado
   npm run dev
   ```

2. **Copia tu IP local** (aparecerá al ejecutar el script)

3. **En tu teléfono:**
   - URL: `http://[TU_IP]:3000`

4. **Prueba todo:**
   - ✅ Acceso desde cualquier teléfono en tu red
   - ✅ APIs del backend funcionando
   - ✅ Logins, formularios, etc.

---

## 🔍 Cómo encontrar tu IP local:

**Windows (PowerShell):**
```powershell
ipconfig
# Busca "IPv4 Address" en la sección de WiFi/Ethernet
```

**Mac/Linux:**
```bash
ifconfig
# Busca "inet" (no 127.0.0.1)
```

---

## ❌ Solución de problemas:

**"No puedo acceder desde el teléfono"**
- ✅ ¿Están en la misma WiFi?
- ✅ ¿El firewall permite conexiones?
- ✅ ¿Usaste la IP correcta?

**"Dice que no puede conectar a la API"**
- Abre DevTools en tu teléfono (Android: F12)
- Verifica que la URL de API es correcta: `http://[IP]:3001`
