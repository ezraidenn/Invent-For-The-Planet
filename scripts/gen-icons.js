const fs = require("fs");
const path = require("path");

// Generate a simple SVG icon and save as SVG (browsers accept SVG for manifest too)
// For production, use a proper PNG generator

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#10b981"/>
  <g transform="translate(256,256)">
    <path d="M-80,-120 C-80,-160 -40,-180 0,-160 C40,-180 80,-160 80,-120 C80,-60 0,20 0,20 C0,20 -80,-60 -80,-120Z" 
          fill="none" stroke="white" stroke-width="16" transform="translate(0,-30) scale(1.3)"/>
    <line x1="-60" y1="80" x2="60" y2="80" stroke="white" stroke-width="14" stroke-linecap="round"/>
    <line x1="-40" y1="110" x2="40" y2="110" stroke="white" stroke-width="14" stroke-linecap="round"/>
    <line x1="0" y1="-50" x2="0" y2="50" stroke="white" stroke-width="12" stroke-linecap="round" transform="translate(0,-30)"/>
    <line x1="-30" y1="-20" x2="0" y2="-50" stroke="white" stroke-width="12" stroke-linecap="round" transform="translate(0,-30)"/>
    <line x1="30" y1="-20" x2="0" y2="-50" stroke="white" stroke-width="12" stroke-linecap="round" transform="translate(0,-30)"/>
  </g>
</svg>`;

const iconsDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

// Save SVG versions
fs.writeFileSync(path.join(iconsDir, "icon-192.svg"), svg);
fs.writeFileSync(path.join(iconsDir, "icon-512.svg"), svg);
// Also save as .png extension (the SVG content will still be valid for dev, 
// but for production you'd use sharp or canvas to convert)
fs.writeFileSync(path.join(iconsDir, "icon-192.png"), svg);
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), svg);
fs.writeFileSync(path.join(iconsDir, "favicon.svg"), svg);

console.log("Icons generated in public/icons/");
