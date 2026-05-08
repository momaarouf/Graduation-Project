const fs = require('fs');
const files = [
  'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/src/components/auth/EmailVerificationForm.tsx',
  'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/src/components/auth/ResetPasswordForm.tsx'
];
for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /className=\"surface-card rounded-2xl border border-theme shadow-xl p-8/g,
      'className=\"w-full sm:surface-card rounded-[2rem] sm:border border-theme sm:shadow-xl p-4 sm:p-8'
    );
    content = content.replace(
      /className=\"surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8/g,
      'className=\"w-full sm:surface-card rounded-[2rem] sm:border border-theme sm:shadow-xl p-4 sm:p-8'
    );
    fs.writeFileSync(file, content);
  }
}
console.log('Other auth forms updated');
