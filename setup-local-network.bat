@echo off
REM Script para Windows - Obtener IP local y configurar

REM Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "LOCAL_IP=%%a"
    goto found
)

:found
set "LOCAL_IP=%LOCAL_IP:~1%"

echo.
echo 🌐 IP Local detectada: %LOCAL_IP%
echo.

REM Crear .env.local con la IP local
(
echo # IP local para acceso desde otros dispositivos
echo NEXT_PUBLIC_API_URL=http://%LOCAL_IP%:3001
) > .env.local

echo ✅ .env.local creado
echo.
echo 📱 Para acceder desde tu teléfono:
echo    1. Asegúrate de estar en la misma WiFi
echo    2. Abre: http://%LOCAL_IP%:3000
echo    3. El backend estará en: http://%LOCAL_IP%:3001
echo.
pause
