#!/bin/bash

# Script para obtener la IP local y configurar variables de entorno

# Obtener IP local (Windows/Mac/Linux)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  LOCAL_IP=$(ipconfig | grep -A 4 "Ethernet adapter\|Adaptador de Ethernet\|WiFi" | grep "Dirección IPv4\|IPv4 Address" | head -1 | awk '{print $NF}')
else
  # Mac/Linux
  LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
fi

echo "🌐 IP Local detectada: $LOCAL_IP"

# Crear .env.local con la IP local
cat > .env.local << EOF
# IP local para acceso desde otros dispositivos
NEXT_PUBLIC_API_URL=http://$LOCAL_IP:3001
EOF

echo "✅ .env.local creado:"
echo "   NEXT_PUBLIC_API_URL=http://$LOCAL_IP:3001"
echo ""
echo "📱 Para acceder desde tu teléfono:"
echo "   1. Asegúrate de estar en la misma WiFi"
echo "   2. Abre: http://$LOCAL_IP:3000"
echo "   3. El backend estará en: http://$LOCAL_IP:3001"
