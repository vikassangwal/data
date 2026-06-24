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
  let originalContent = content;

  if (content.includes('<table') && !content.includes('overflow-x-auto')) {
     content = content.replace(/(<table[^>]*>)/g, '<div className="overflow-x-auto w-full">\n$1');
     content = content.replace(/(<\/table>)/g, '$1\n</div>');
  }

  content = content.replace(/(?<!sm:|md:|lg:|xl:)grid-cols-([2-9])/g, 'grid-cols-1 sm:grid-cols-$1');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});
