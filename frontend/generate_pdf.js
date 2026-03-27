const { jsPDF } = require("jspdf");
const fs = require("fs");

try {
  const doc = new jsPDF();
  const text = fs.readFileSync("../Baymax_Documentation.md", "utf8");

  // Basic markdown text to pdf
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(text, 180);

  let y = 10;
  for (let i = 0; i < lines.length; i++) {
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
    doc.text(lines[i], 10, y);
    y += 5;
  }

  doc.save("../Baymax_Documentation.pdf");
  console.log("PDF successfully generated!");
} catch (e) {
  console.error("Error generating PDF:", e.message);
}
