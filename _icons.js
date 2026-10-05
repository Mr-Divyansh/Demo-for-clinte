const fs = require('fs');
const path = require('path');

const DIR = path.join(process.env.TEMP, 'reicon-extract', 'node_modules', 'reicon', 'icons');

const want = ['ArrowRight', 'ShoppingCart', 'Search', 'Truck', 'ShieldCheck', 'Check',
  'Location', 'Plus', 'Minus', 'Instagram', 'Package', 'Wallet', 'Dumbbell',
  'Bolt', 'Tag', 'Fire', 'Box', 'Money', 'Star'];

const out = {};
for (const name of want) {
  const p = path.join(DIR, name + '.js');
  if (!fs.existsSync(p)) { console.log('MISSING ' + name); continue; }
  const src = fs.readFileSync(p, 'utf8');
  const m = src.match(/O:\s*`([\s\S]*?)`/);
  if (m) out[name] = m[1].trim().replace(/\s+/g, ' ').replace(/> </g, '><');
}

fs.writeFileSync('icons-out.json', JSON.stringify(out, null, 2));
console.log('OK ' + Object.keys(out).length + ' icons written');

// verify every body is balanced-ish and starts with a tag
for (const [k, v] of Object.entries(out)) {
  if (!v.startsWith('<')) console.log('WARN ' + k + ' does not start with <');
}
console.log(Object.keys(out).join(', '));