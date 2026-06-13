const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const qr1 = JSON.stringify({ location: 'triaje', waypointIndex: 1, message: 'Triaje' });
const qr2 = JSON.stringify({ location: 'admision', waypointIndex: 0, message: 'Admisión' });

QRCode.toFile(path.join(publicDir, 'qr-triaje.png'), qr1, {
  color: { dark: '#0d9488', light: '#ffffff' },
  width: 300
}, function (err) {
  if (err) throw err;
  console.log('QR 1 created');
});

QRCode.toFile(path.join(publicDir, 'qr-admision.png'), qr2, {
  color: { dark: '#4338ca', light: '#ffffff' },
  width: 300
}, function (err) {
  if (err) throw err;
  console.log('QR 2 created');
});
