import { networkInterfaces } from 'os'
import qrcode from 'qrcode-terminal'
import { execSync } from 'child_process'

const nets = networkInterfaces()
let localIp = 'localhost'

for (const name of Object.keys(nets)) {
  const isVirtual = name.toLowerCase().includes('wsl') || name.toLowerCase().includes('vmware') || name.toLowerCase().includes('virtual') || name.toLowerCase().includes('veth');
  if (isVirtual) continue;

  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      localIp = net.address;
      break;
    }
  }
}

const url = `http://${localIp}:3000`
console.log(`\n📱 Scan to open on phone:\n`)
qrcode.generate(url, { small: true })
console.log(`\n🔗 ${url}\n`)

// We don't need to inject NEXT_PUBLIC_API_URL anymore.
// client.ts automatically uses the same IP for the backend, just on port 8081.

// Expose the local IP to the frontend so the navbar QR code can render instantly
process.env.NEXT_PUBLIC_LOCAL_IP = localIp;

execSync('next dev --hostname 0.0.0.0', { 
  stdio: 'inherit',
  env: process.env
});
