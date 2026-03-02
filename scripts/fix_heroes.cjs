const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'data', 'heroes.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\}, powerSpike: '([^']+)', mobilityLevel: '([^']+)', ccLevel: '([^']+)'(,?)/g, ", powerSpike: '$1', mobilityLevel: '$2', ccLevel: '$3' }$4");

fs.writeFileSync(file, content);
console.log('Fixed heroes.ts syntax.');
