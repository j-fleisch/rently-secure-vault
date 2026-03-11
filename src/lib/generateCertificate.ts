// Certificate of Insurance PDF generator (pure client-side)
// Uses jsPDF-compatible manual PDF construction

export interface CertificateData {
  policyNumber: string;
  insuredName: string;
  mailingAddress: string;
  propertyAddress: string;
  effectiveDate: string;
  expiryDate: string;
  tier: string;
  annualPremium: number;
  monthlyPremium: number;
  liabilityLimit: string;
  replacementCost: number;
  rentalIncomeLimit: number;
  additionalInsuredName?: string;
  additionalInsuredType?: string;
}

export function generateCertificatePDF(data: CertificateData): Blob {
  // Build a simple PDF manually (PDF 1.4 spec)
  const lines: string[] = [];
  let objectCount = 0;
  const offsets: number[] = [];

  const addObject = (content: string) => {
    objectCount++;
    offsets.push(lines.join("\n").length + 1);
    lines.push(`${objectCount} 0 obj`);
    lines.push(content);
    lines.push("endobj");
    return objectCount;
  };

  lines.push("%PDF-1.4");

  // Catalog
  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  // Pages
  addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  // Page
  addObject("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>");

  // Build content stream
  const tierLabel = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
  const textLines = [
    { text: "CERTIFICATE OF INSURANCE", x: 180, y: 740, font: "F2", size: 18 },
    { text: "Cedar Insurance — Managing General Agency", x: 175, y: 715, font: "F1", size: 10 },
    { text: `Policy Number: ${data.policyNumber}`, x: 72, y: 680, font: "F2", size: 12 },
    { text: `Date Issued: ${new Date().toLocaleDateString("en-CA")}`, x: 72, y: 660, font: "F1", size: 10 },
    { text: "NAMED INSURED", x: 72, y: 630, font: "F2", size: 11 },
    { text: data.insuredName, x: 72, y: 614, font: "F1", size: 10 },
    { text: data.mailingAddress || "—", x: 72, y: 598, font: "F1", size: 10 },
    { text: "PROPERTY ADDRESS", x: 72, y: 568, font: "F2", size: 11 },
    { text: data.propertyAddress, x: 72, y: 552, font: "F1", size: 10 },
    { text: "COVERAGE DETAILS", x: 72, y: 522, font: "F2", size: 11 },
    { text: `Plan: ${tierLabel}`, x: 72, y: 506, font: "F1", size: 10 },
    { text: `Effective: ${data.effectiveDate}  —  Expiry: ${data.expiryDate}`, x: 72, y: 490, font: "F1", size: 10 },
    { text: `Annual Premium: $${data.annualPremium.toLocaleString()}  ($${data.monthlyPremium}/mo)`, x: 72, y: 474, font: "F1", size: 10 },
    { text: `Dwelling / Replacement Cost: $${data.replacementCost.toLocaleString()}`, x: 72, y: 458, font: "F1", size: 10 },
    { text: `Liability Limit: ${data.liabilityLimit}`, x: 72, y: 442, font: "F1", size: 10 },
    { text: `Loss of Rental Income: $${data.rentalIncomeLimit.toLocaleString()}`, x: 72, y: 426, font: "F1", size: 10 },
  ];

  if (data.additionalInsuredName) {
    textLines.push(
      { text: "ADDITIONAL INSURED", x: 72, y: 396, font: "F2", size: 11 },
      { text: `${data.additionalInsuredName} (${data.additionalInsuredType || "Mortgage Lender"})`, x: 72, y: 380, font: "F1", size: 10 },
    );
  }

  const disclaimerY = data.additionalInsuredName ? 340 : 380;
  textLines.push(
    { text: "This certificate is issued as a matter of information only and confers no rights upon the", x: 72, y: disclaimerY, font: "F1", size: 8 },
    { text: "certificate holder. Coverage is subject to all terms and conditions of the policy. This certificate", x: 72, y: disclaimerY - 12, font: "F1", size: 8 },
    { text: "does not amend, extend, or alter the coverage afforded by the policy. Cedar Insurance is a", x: 72, y: disclaimerY - 24, font: "F1", size: 8 },
    { text: "managing general agency. Coverage is underwritten by A-rated Canadian carriers.", x: 72, y: disclaimerY - 36, font: "F1", size: 8 },
  );

  let stream = "";
  for (const line of textLines) {
    stream += `BT /${line.font} ${line.size} Tf ${line.x} ${line.y} Td (${escapePDF(line.text)}) Tj ET\n`;
  }
  // Add a green line
  stream += "0.176 0.416 0.310 RG\n2 w\n72 700 m 540 700 l S\n";

  const streamBytes = new TextEncoder().encode(stream);
  addObject(`<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream`);

  // Fonts
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  // Cross-reference
  const xrefOffset = lines.join("\n").length + 1;
  lines.push("xref");
  lines.push(`0 ${objectCount + 1}`);
  lines.push("0000000000 65535 f ");
  for (const offset of offsets) {
    lines.push(String(offset).padStart(10, "0") + " 00000 n ");
  }
  lines.push("trailer");
  lines.push(`<< /Size ${objectCount + 1} /Root 1 0 R >>`);
  lines.push("startxref");
  lines.push(String(xrefOffset));
  lines.push("%%EOF");

  return new Blob([lines.join("\n")], { type: "application/pdf" });
}

function escapePDF(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function downloadCertificate(data: CertificateData) {
  const blob = generateCertificatePDF(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Cedar-COI-${data.policyNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
