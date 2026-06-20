// pdf-generator.js - PDF Generation with Download Popup

function loadPDFLibrary() {
    return new Promise((resolve) => {
        if (typeof window.jspdf !== 'undefined') {
            resolve(window.jspdf);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => resolve(window.jspdf);
        document.head.appendChild(script);
    });
}

// Generate Stage Report PDF
async function generateStageReportPDF(data) {
    await loadPDFLibrary();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 20;
    let y = 20;

    // LASBCA Header
    doc.setFillColor(0, 11, 26);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFillColor(0, 212, 255);
    doc.roundedRect(margin, 10, 30, 10, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(0, 11, 26);
    doc.text('LASBCA', margin + 4, 18);

    doc.setFontSize(14);
    doc.setTextColor(0, 212, 255);
    doc.text('LAGOS STATE BUILDING CONTROL AGENCY', margin + 35, 18);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Oba Akinjobi Way, Ikeja, Lagos', margin, 35);

    // Title
    y = 55;
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('STAGE REPORT', margin, y);

    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);

    // Report ID and Date
    y += 12;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`File Number: ${data.fileNo || 'N/A'}`, margin, y);
    doc.text(`Date: ${data.reportDate || new Date().toLocaleDateString()}`, pageWidth - margin - 40, y);

    // Project Information
    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(0, 212, 255);
    doc.text('PROJECT INFORMATION', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    const fields = [
        ['File Number:', data.fileNo || 'N/A'],
        ['LASPPA Permit:', data.lasppaPermit || 'N/A (if applicable)'],
        ['Developer:', data.developer || 'N/A'],
        ['Project:', data.project || 'N/A'],
        ['Address:', data.address || 'N/A']
    ];
    fields.forEach(([label, value]) => {
        doc.text(label, margin, y);
        doc.text(value, margin + 45, y);
        y += 7;
    });

    // Stage Information
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(0, 212, 255);
    doc.text('STAGE INFORMATION', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    const stageFields = [
        ['Stage Number:', data.stageNumber || 'N/A'],
        ['Stage Type:', data.stageType || 'N/A'],
        ['Team:', data.team || 'N/A'],
        ['Team Head:', data.teamHead || 'N/A']
    ];
    stageFields.forEach(([label, value]) => {
        doc.text(label, margin, y);
        doc.text(value, margin + 45, y);
        y += 7;
    });

    // Dates
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(0, 212, 255);
    doc.text('DATES', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Date of Capturing:', margin, y);
    doc.text(data.capturingDate || 'N/A', margin + 45, y);
    y += 7;
    doc.text('Date of Report:', margin, y);
    doc.text(data.reportDate || 'N/A', margin + 45, y);

    // Observations
    if (data.observations) {
        y += 7;
        doc.setFontSize(12);
        doc.setTextColor(0, 212, 255);
        doc.text('OBSERVATIONS', margin, y);

        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        const obsLines = doc.splitTextToSize(data.observations, pageWidth - margin * 2);
        obsLines.forEach(line => {
            doc.text(line, margin, y);
            y += 6;
        });
    }

    // Instructions
    if (data.instructions) {
        y += 7;
        doc.setFontSize(12);
        doc.setTextColor(0, 212, 255);
        doc.text('INSTRUCTIONS FOR DEVELOPER', margin, y);

        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        const instLines = doc.splitTextToSize(data.instructions, pageWidth - margin * 2);
        instLines.forEach(line => {
            doc.text(line, margin, y);
            y += 6;
        });
    }

    // Signature
    y += 7;
    doc.setFontSize(12);
    doc.setTextColor(0, 212, 255);
    doc.text('SIGNATURE', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Team Head Signature:', margin, y);
    doc.text(data.signature || 'Signed', margin + 45, y);

    // Footer
    y = 270;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('LASBCA · Oba Akinjobi Way, Ikeja, Lagos', margin, y + 10);
    doc.text('"Build Right, Avoid Collapse"', margin, y + 16);
    doc.text('This is an official LASBCA report.', pageWidth - margin - 55, y + 10);

    // Generate PDF as blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const fileName = `${data.fileNo || 'Report'}.pdf`;

    // Show download popup
    showDownloadPopup(pdfUrl, fileName);

    return { pdfBlob, pdfUrl, fileName };
}

// Generate Contravention PDF
async function generateContraventionPDF(data) {
    await loadPDFLibrary();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 20;
    let y = 20;

    // Header
    doc.setFillColor(80, 0, 0);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFillColor(255, 200, 200);
    doc.roundedRect(margin, 10, 30, 10, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(80, 0, 0);
    doc.text('LASBCA', margin + 4, 18);

    doc.setFontSize(14);
    doc.setTextColor(255, 200, 200);
    doc.text('LAGOS STATE BUILDING CONTROL AGENCY', margin + 35, 18);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Oba Akinjobi Way, Ikeja, Lagos', margin, 35);

    // Title
    y = 55;
    doc.setFontSize(18);
    doc.setTextColor(255, 100, 100);
    doc.text('CONTRAVENTION NOTICE', margin, y);

    doc.setDrawColor(255, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);

    // Report ID and Date
    y += 12;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`File Number: ${data.fileNo || 'N/A'}`, margin, y);
    doc.text(`Date: ${data.reportDate || new Date().toLocaleDateString()}`, pageWidth - margin - 40, y);

    // Severity Badge
    y += 10;
    const severity = data.severity || 'High';
    const severityColors = {
        critical: [200, 50, 50],
        high: [255, 150, 0],
        medium: [255, 200, 0],
        low: [100, 200, 100]
    };
    const color = severityColors[severity.toLowerCase()] || [200, 200, 200];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(pageWidth - margin - 55, y - 4, 45, 8, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`SEVERITY: ${severity.toUpperCase()}`, pageWidth - margin - 50, y + 2);

    // Property Information
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(255, 200, 200);
    doc.text('PROPERTY INFORMATION', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    const fields = [
        ['File Number:', data.fileNo || 'N/A'],
        ['LASPPA Permit:', data.lasppaPermit || 'N/A (if applicable)'],
        ['Developer:', data.developer || 'N/A'],
        ['Property:', data.address || 'N/A'],
        ['Stage:', data.stageNumber ? data.stageNumber + ' (' + data.stageType + ')' : 'N/A'],
        ['Team:', data.team || 'N/A'],
        ['Team Head:', data.teamHead || 'N/A']
    ];
    fields.forEach(([label, value]) => {
        doc.text(label, margin, y);
        doc.text(value, margin + 45, y);
        y += 7;
    });

    // Violation Details
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(255, 200, 200);
    doc.text('VIOLATION DETAILS', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Violation:', margin, y);
    doc.text(data.details || 'N/A', margin + 30, y);
    y += 7;
    doc.text('Status:', margin, y);
    doc.text(data.status || 'Active', margin + 30, y);
    y += 7;
    doc.text('Date Detected:', margin, y);
    doc.text(data.capturingDate || 'N/A', margin + 30, y);

    // Recommended Action
    y += 7;
    doc.setFontSize(12);
    doc.setTextColor(255, 200, 100);
    doc.text('RECOMMENDED ACTION', margin, y);

    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('➡️ ' + (data.action || 'Stop Work Order'), margin, y);

    // Signature
    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(255, 200, 200);
    doc.text('SIGNATURE', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Team Head Signature:', margin, y);
    doc.text(data.signature || 'Signed', margin + 45, y);

    // Footer
    y = 270;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('LASBCA · Oba Akinjobi Way, Ikeja, Lagos', margin, y + 10);
    doc.text('"Build Right, Avoid Collapse"', margin, y + 16);
    doc.text('This notice is legally binding.', pageWidth - margin - 50, y + 10);

    // Generate PDF as blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const fileName = `${data.fileNo || 'Contravention'}.pdf`;

    showDownloadPopup(pdfUrl, fileName);

    return { pdfBlob, pdfUrl, fileName };
}

// Generate PCA Audit PDF
async function generatePCAPDF(data) {
    await loadPDFLibrary();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 20;
    let y = 20;

    // Header
    doc.setFillColor(0, 40, 60);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFillColor(100, 200, 255);
    doc.roundedRect(margin, 10, 30, 10, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(0, 40, 60);
    doc.text('LASBCA', margin + 4, 18);

    doc.setFontSize(14);
    doc.setTextColor(100, 200, 255);
    doc.text('LAGOS STATE BUILDING CONTROL AGENCY', margin + 35, 18);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Oba Akinjobi Way, Ikeja, Lagos', margin, 35);

    // Title
    y = 55;
    doc.setFontSize(18);
    doc.setTextColor(100, 200, 255);
    doc.text('PCA AUDIT REPORT', margin, y);

    doc.setDrawColor(100, 200, 255);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);

    // Report ID and Date
    y += 12;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`File Number: ${data.fileNo || 'N/A'}`, margin, y);
    doc.text(`Date: ${data.reportDate || new Date().toLocaleDateString()}`, pageWidth - margin - 40, y);

    // Project Details
    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(100, 200, 255);
    doc.text('PROJECT DETAILS', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    const fields = [
        ['File Number:', data.fileNo || 'N/A'],
        ['LASPPA Permit:', data.lasppaPermit || 'N/A (if applicable)'],
        ['Developer:', data.developer || 'N/A'],
        ['Project:', data.project || 'N/A'],
        ['Address:', data.address || 'N/A'],
        ['Auditor:', data.auditor || 'N/A'],
        ['Team Head:', data.teamHead || 'N/A']
    ];
    fields.forEach(([label, value]) => {
        doc.text(label, margin, y);
        doc.text(value, margin + 45, y);
        y += 7;
    });

    // Compliance Score
    y += 5;
    const score = data.score || 92;
    doc.setFontSize(12);
    doc.setTextColor(100, 200, 255);
    doc.text('COMPLIANCE SCORE', margin, y);

    y += 8;
    doc.setFontSize(16);
    doc.setTextColor(200, 200, 200);
    doc.text(score + '%', margin, y);

    // Score bar
    doc.setFillColor(50, 50, 50);
    doc.rect(margin + 30, y - 4, 100, 8, 'F');
    const barColor = score >= 80 ? [76, 175, 80] : score >= 60 ? [255, 193, 7] : [255, 100, 100];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.rect(margin + 30, y - 4, score, 8, 'F');

    // Dates
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(100, 200, 255);
    doc.text('DATES', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Audit Date:', margin, y);
    doc.text(data.date || 'N/A', margin + 45, y);
    y += 7;
    doc.text('Report Date:', margin, y);
    doc.text(data.reportDate || 'N/A', margin + 45, y);

    // Notes
    if (data.notes) {
        y += 7;
        doc.setFontSize(12);
        doc.setTextColor(100, 200, 255);
        doc.text('AUDITOR NOTES', margin, y);

        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        const notesLines = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
        notesLines.forEach(line => {
            doc.text(line, margin, y);
            y += 6;
        });
    }

    // Signature
    y += 7;
    doc.setFontSize(12);
    doc.setTextColor(100, 200, 255);
    doc.text('SIGNATURE', margin, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Team Head Signature:', margin, y);
    doc.text(data.signature || 'Signed', margin + 45, y);

    // Footer
    y = 270;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('LASBCA · Oba Akinjobi Way, Ikeja, Lagos', margin, y + 10);
    doc.text('"Build Right, Avoid Collapse"', margin, y + 16);
    doc.text('This is an official LASBCA report.', pageWidth - margin - 55, y + 10);

    // Generate PDF as blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const fileName = `${data.fileNo || 'PCA-Audit'}.pdf`;

    showDownloadPopup(pdfUrl, fileName);

    return { pdfBlob, pdfUrl, fileName };
}

// ===== DOWNLOAD POPUP =====
function showDownloadPopup(pdfUrl, fileName) {
    const existingPopup = document.getElementById('pdfDownloadPopup');
    if (existingPopup) existingPopup.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pdfDownloadPopup';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 9999; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s ease;
    `;

    const popup = document.createElement('div');
    popup.style.cssText = `
        background: #141d2b; border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 24px; padding: 2.5rem; max-width: 460px; width: 92%;
        text-align: center; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
        animation: slideUp 0.3s ease;
    `;
    popup.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 0.5rem;">✅</div>
        <h2 style="color: #eef2f8; font-size: 1.5rem; margin-bottom: 0.3rem;">Report Submitted!</h2>
        <p style="color: #889bc2; font-size: 0.9rem; margin-bottom: 0.5rem;">
            Your report has been successfully saved.
        </p>
        <div style="background: rgba(0, 212, 255, 0.05); border-radius: 12px; padding: 0.8rem; margin: 0.8rem 0;">
            <span style="color: #00d4ff; font-weight: 600;">📄 PDF Ready</span>
            <span style="color: #5a6f92; font-size: 0.8rem; display: block;">${fileName}</span>
        </div>
        <button onclick="window.downloadPDF('${pdfUrl}', '${fileName}')"
            style="background: linear-gradient(135deg, #00d4ff, #0088cc);
                   border: none; padding: 0.8rem 2.5rem; border-radius: 40px;
                   font-weight: 700; font-size: 1rem; color: #0b0f1a;
                   cursor: pointer; width: 100%; margin-top: 0.5rem;
                   transition: 0.2s; font-family: 'Inter', sans-serif;">
            📥 Download PDF
        </button>
        <div style="display: flex; gap: 0.8rem; margin-top: 0.8rem;">
            <button onclick="window.closePopup(); window.location.href='reports.html';"
                style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06);
                       padding: 0.6rem; border-radius: 40px; color: #889bc2; cursor: pointer;
                       font-family: 'Inter', sans-serif; font-size: 0.8rem;">
                📋 View Reports
            </button>
            <button onclick="window.closePopup(); window.location.reload();"
                style="flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
                       padding: 0.6rem; border-radius: 40px; color: #889bc2; cursor: pointer;
                       font-family: 'Inter', sans-serif; font-size: 0.8rem;">
                ➕ New Report
            </button>
        </div>
        <button onclick="window.closePopup()"
            style="background: none; border: none; color: #5a6f92; font-size: 0.7rem;
                   margin-top: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif;">
            Close
        </button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Add styles if not present
    if (!document.getElementById('popupStyles')) {
        const style = document.createElement('style');
        style.id = 'popupStyles';
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `;
        document.head.appendChild(style);
    }

    window._pdfUrl = pdfUrl;
    window._fileName = fileName;
}

window.downloadPDF = function(url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (window.showToast) {
        window.showToast('✅ PDF downloaded successfully!');
    }
    setTimeout(() => { window.closePopup(); }, 1500);
};

window.closePopup = function() {
    const popup = document.getElementById('pdfDownloadPopup');
    if (popup) {
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.3s ease';
        setTimeout(() => { popup.remove(); }, 300);
    }
};

// Make functions globally available
window.generateStageReportPDF = generateStageReportPDF;
window.generateContraventionPDF = generateContraventionPDF;
window.generatePCAPDF = generatePCAPDF;
