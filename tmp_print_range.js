const fs = require("fs");

const file = process.argv[2];
const start = Number(process.argv[3] || 1);
const end = Number(process.argv[4] || start + 50);

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
for (let i = Math.max(1, start); i <= Math.min(end, lines.length); i += 1) {
  console.log(`${i}: ${lines[i - 1]}`);
}
