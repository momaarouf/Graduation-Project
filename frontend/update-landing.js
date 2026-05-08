const fs = require('fs');
const file = 'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/src/components/landing/LandingV3.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<form onSubmit={handleSearch} className=\"flex flex-col md:flex-row gap-3\">/,
  '<form onSubmit={handleSearch} className=\"flex items-center md:flex-row gap-2 md:gap-3\">'
);
content = content.replace(
  /rounded-2xl transition-all/,
  'rounded-full md:rounded-2xl transition-all'
);
content = content.replace(
  /<Search className=\"absolute left-7 top-1\/2 -translate-y-1\/2 text-theme-muted w-6 h-6 group-hover:text-orange-500 transition-colors pointer-events-none\" \/>/,
  '<Search className=\"absolute left-4 md:left-7 top-1/2 -translate-y-1/2 text-theme-muted w-5 h-5 md:w-6 md:h-6 group-hover:text-orange-500 transition-colors pointer-events-none\" />'
);
content = content.replace(
  /<div className=\"flex flex-col pl-16 pr-6 py-4\">/,
  '<div className=\"flex flex-col pl-12 md:pl-16 pr-4 md:pr-6 py-3 md:py-4 flex-1\">'
);
content = content.replace(
  /<span className=\"text-\[10px\] uppercase tracking-\[0\.2em\] font-black text-theme-muted group-hover:text-orange-500\/70 transition-colors text-left uppercase whitespace-nowrap\">Explore Global Destinations<\/span>/,
  '<span className=\"hidden md:block text-[10px] uppercase tracking-[0.2em] font-black text-theme-muted group-hover:text-orange-500/70 transition-colors text-left whitespace-nowrap\">Explore Global Destinations</span>'
);
content = content.replace(
  /className={`w-full bg-transparent text-theme-primary border-0 focus:ring-0 font-bold placeholder-gray-400 p-0 leading-tight transition-all duration-300 \${/,
  'className={`w-full bg-transparent text-theme-primary border-0 focus:ring-0 font-bold placeholder-gray-400 p-0 leading-tight transition-all duration-300 text-lg md:text-xl ${'
);
content = content.replace(
  /<button \n\s*type=\"submit\" \n\s*className=\"bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all text-white px-10 py-5 lg:py-0 rounded-\[1\.8rem\] font-black text-lg shadow-2xl shadow-orange-600\/30\"\n\s*>\n\s*Let's Go\n\s*<\/button>/,
  `<button 
  type=\"submit\" 
  className=\"bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all text-white p-3 md:px-10 md:py-0 aspect-square md:aspect-auto rounded-full md:rounded-[1.8rem] font-black md:text-lg shadow-xl shadow-orange-600/30 flex items-center justify-center\"
>
  <span className=\"hidden md:block\">Let's Go</span>
  <ArrowRight className=\"w-5 h-5 md:hidden\" />
</button>`
);

content = content.replace(
  /className=\"flex-1 w-full max-w-lg lg:max-w-xl aspect-square relative\"/,
  'className=\"flex-1 w-full max-w-[280px] sm:max-w-[320px] md:max-w-lg lg:max-w-xl aspect-square relative mx-auto mt-8 md:mt-0\"'
);

content = content.replace(
  /<div className=\"grid grid-cols-1 lg:grid-cols-2 gap-12\">/,
  '<div className=\"flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-12 pb-8 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2\">'
);
content = content.replace(
  /className=\"group relative\"/g,
  'className=\"group relative snap-center min-w-[85vw] md:min-w-0\"'
);

content = content.replace(
  /className=\"space-y-12 sm:space-y-28 md:space-y-40\"/,
  'className=\"space-y-8 sm:space-y-28 md:space-y-40\"'
);
content = content.replace(
  /className=\"group p-8 rounded-\[2\.5rem\]/g,
  'className=\"group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]'
);

content = content.replace(
  /<div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8\">/,
  '<div className=\"flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-8 pb-6 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4\">'
);
content = content.replace(
  /className=\"p-5 sm:p-8 lg:p-10 rounded-\[2rem\] sm:rounded-\[3rem\] surface-card border border-theme dark:border-theme-strong flex flex-col items-center text-center group hover:bg-primary-light\/5 dark:hover:surface-card\/\[0\.08\] transition-all\"/g,
  'className=\"p-6 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[3rem] surface-card border border-theme dark:border-theme-strong flex flex-col items-center text-center group hover:bg-primary-light/5 dark:hover:surface-card/[0.08] transition-all snap-center min-w-[75vw] sm:min-w-[40vw] md:min-w-0 shrink-0\"'
);

fs.writeFileSync(file, content);
console.log('Successfully updated LandingV3.tsx');
