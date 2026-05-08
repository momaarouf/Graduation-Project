const fs = require('fs');
const file = 'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/src/components/layout/MobileBottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useSearchParams')) {
  content = content.replace(
    /import \{ usePathname \} from 'next\/navigation'/,
    "import { usePathname, useSearchParams } from 'next/navigation'"
  );
}

content = content.replace(
  /const pathname = usePathname\(\)/,
  `const pathname = usePathname()\n  const searchParams = useSearchParams()\n  const hasChatId = searchParams?.get('id') != null`
);

content = content.replace(
  /if \(pathname\?\.startsWith\('\/auth'\) \|\| pathname\?\.startsWith\('\/dashboard\/admin'\)\) \{/,
  `if (pathname?.startsWith('/auth') || pathname?.startsWith('/dashboard/admin') || (pathname?.includes('/messages') && hasChatId)) {`
);

fs.writeFileSync(file, content);
console.log('MobileBottomNav updated to hide in active chat');
