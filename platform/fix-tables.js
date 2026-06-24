const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/app', function(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let newContent = content.replace(/<table[^>]*>[\s\S]*?<\/table>/g, function(match, offset, string) {
      let prefix = string.substring(Math.max(0, offset - 150), offset);
      if (prefix.includes('overflow-x-auto') || prefix.includes('overflow-y-auto')) {
          return match; // Already wrapped
      }
      changed = true;
      return `<div className="overflow-x-auto w-full">\n${match}\n</div>`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated Tables: ${filePath}`);
  }
});
