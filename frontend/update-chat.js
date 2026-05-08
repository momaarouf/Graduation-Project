const fs = require('fs');
const files = [
  'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/app/dashboard/traveler/messages/page.tsx',
  'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/app/dashboard/guide/messages/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Make the chat window fixed full-screen on mobile
  content = content.replace(
    /<div className=\{\`flex-1 flex flex-col overflow-hidden \$\{\!showSidebar \? 'block' : 'hidden sm:block'\}\`\}>/,
    `<div className={\`flex-1 flex flex-col overflow-hidden \${!showSidebar ? 'fixed inset-0 z-[100] surface-base md:relative md:z-auto' : 'hidden sm:flex'}\`}>`
  );

  // 2. Make the input bar native-like
  content = content.replace(
    /<div className=\"flex-none p-4 border-t border-theme\">\n\s*<form onSubmit=\{handleSendMessage\} className=\"flex gap-2\">\n\s*<input type=\"text\" value=\{newMessage\} onChange=\{e => setNewMessage\(e\.target\.value\)\} placeholder=\"Type a message\.\.\.\" className=\"flex-1 px-4 py-2 surface-section border-none rounded-lg text-sm\" \/>\n\s*<button type=\"submit\" disabled=\{\!newMessage\.trim\(\)\} className=\"p-2 bg-primary-light text-white rounded-lg disabled:opacity-50\"><Send className=\"w-5 h-5\" \/><\/button>\n\s*<\/form>\n\s*<\/div>/g,
    `<div className="flex-none p-3 sm:p-4 border-t border-theme surface-base pb-[max(env(safe-area-inset-bottom),12px)]">
  <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
  <textarea 
    value={newMessage} 
    onChange={e => setNewMessage(e.target.value)} 
    placeholder="Type a message..." 
    className="flex-1 px-4 py-3 surface-section border border-theme rounded-3xl text-sm shadow-sm focus:ring-2 focus:ring-primary-light resize-none min-h-[44px] max-h-[120px]"
    rows={1}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    }}
  />
  <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-primary-light text-white rounded-full disabled:opacity-50 shadow-md active:scale-95 transition-transform flex-shrink-0 h-[44px] w-[44px] flex items-center justify-center"><Send className="w-5 h-5 ml-0.5" /></button>
  </form>
  </div>`
  );

  // 3. Make sure the container is h-[100dvh]
  content = content.replace(
    /<div className=\"h-\[calc\(100vh-4rem\)\] surface-base overflow-hidden\">/g,
    `<div className="h-[100dvh] md:h-[calc(100vh-4rem)] surface-base overflow-hidden">`
  );

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
