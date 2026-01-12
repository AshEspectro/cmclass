import fs from "fs";
import { globSync } from "glob";

for (const f of globSync("src/**/*.{ts,tsx}")) {
  let c = fs.readFileSync(f, "utf8");
  let n = c.replace(/(['"])([^'"]+)@\d+\.\d+\.\d+\1/g, '"$2"');
  if (c !== n) {
    fs.writeFileSync(f, n);
    console.log("fixed", f);
  }
}


console.log("All versioned imports cleaned!");
