import { NextResponse } from 'next/server';
import { networkInterfaces } from 'os';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not dev' }, { status: 403 });
  }

  const nets = networkInterfaces();
  let localIp = 'localhost';

  for (const name of Object.keys(nets)) {
    const isVirtual = name.toLowerCase().includes('wsl') || 
                      name.toLowerCase().includes('vmware') || 
                      name.toLowerCase().includes('virtual') || 
                      name.toLowerCase().includes('veth');
    if (isVirtual) continue;

    const netInterface = nets[name];
    if (!netInterface) continue;

    for (const net of netInterface) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  return NextResponse.json({ ip: localIp });
}
