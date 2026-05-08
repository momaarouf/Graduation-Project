const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/src/components/auth';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace big cards
  content = content.replace(
    /className=\"surface-card\s*rounded-\[2\.5rem\]\s*border\s*border-theme\s*shadow-2xl\s*p-8\s*sm:p-12\"/g,
    'className=\"w-full sm:surface-card rounded-[2rem] sm:rounded-[2.5rem] sm:border border-theme sm:shadow-2xl p-4 sm:p-12\"'
  );
  content = content.replace(
    /className=\"surface-card\s*rounded-\[2\.5rem\]\s*border\s*border-theme\s*shadow-2xl\s*p-6\s*sm:p-12\"/g,
    'className=\"w-full sm:surface-card rounded-[2rem] sm:rounded-[2.5rem] sm:border border-theme sm:shadow-2xl p-4 sm:p-12\"'
  );
  
  // Also fix the case with double spaces in className="surface-card  rounded-[2.5rem]"
  content = content.replace(
    /className=\"surface-card\s+rounded-\[2\.5rem\]\s+border\s+border-theme\s+shadow-2xl\s+p-8\s+sm:p-12\"/g,
    'className=\"w-full sm:surface-card rounded-[2rem] sm:rounded-[2.5rem] sm:border border-theme sm:shadow-2xl p-4 sm:p-12\"'
  );

  content = content.replace(
    /className=\"surface-card\s+rounded-\[2\.5rem\]\s+border\s+border-theme\s+shadow-2xl\s+p-6\s+sm:p-12\"/g,
    'className=\"w-full sm:surface-card rounded-[2rem] sm:rounded-[2.5rem] sm:border border-theme sm:shadow-2xl p-4 sm:p-12\"'
  );
  
  // Inputs
  content = content.replace(
    /py-2\.5/g,
    'py-3 md:py-2.5'
  );
  
  fs.writeFileSync(filePath, content);
}
console.log('Auth cards updated');
