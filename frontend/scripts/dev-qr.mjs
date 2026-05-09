import { networkInterfaces } from 'os'
import qrcode from 'qrcode-terminal'
import { execSync } from 'child_process'

const nets = networkInterfaces()
let localIp = 'localhost'

// Prioritize Wi-Fi and Ethernet
const priorityOrder = ['wi-fi', 'eth', 'en0', 'ethernet', 'wlan']
const detectedIps = []

for (const name of Object.keys(nets)) {
  const lowerName = name.toLowerCase()
  const isVirtual = 
    lowerName.includes('wsl') || 
    lowerName.includes('vmware') || 
    lowerName.includes('virtual') || 
    lowerName.includes('veth') ||
    lowerName.includes('vmnet') ||
    lowerName.includes('docker') ||
    lowerName.includes('hyper-v');
    
  if (isVirtual) continue;

  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      detectedIps.push({ name, address: net.address })
    }
  }
}

// Select the best IP
if (detectedIps.length > 0) {
  // Sort by priority name
  detectedIps.sort((a, b) => {
    const aPrio = priorityOrder.findIndex(p => a.name.toLowerCase().includes(p))
    const bPrio = priorityOrder.findIndex(p => b.name.toLowerCase().includes(p))
    if (aPrio !== -1 && bPrio === -1) return -1
    if (aPrio === -1 && bPrio !== -1) return 1
    if (aPrio !== -1 && bPrio !== -1) return aPrio - bPrio
    return 0
  })
  localIp = detectedIps[0].address
  console.log(`📡 Selected Interface: ${detectedIps[0].name} (${localIp})`)
}

const nipIp = localIp.replace(/\./g, '-')
const url = `http://${nipIp}.nip.io:3000`
console.log(`\n📱 Scan to open on phone (Google OAuth Compatible):\n`)
qrcode.generate(url, { small: true })
console.log(`\n🔗 ${url}\n`)

// Expose the local IP and nip.io domain to the frontend
process.env.NEXT_PUBLIC_LOCAL_IP = localIp;
process.env.NEXT_PUBLIC_NIP_DOMAIN = `${nipIp}.nip.io`;

console.log(`🚀 Starting Next.js on 0.0.0.0:3000...`)
execSync('next dev --hostname 0.0.0.0', { 
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_LOCAL_IP: localIp, NEXT_PUBLIC_NIP_DOMAIN: `${nipIp}.nip.io` }
});
