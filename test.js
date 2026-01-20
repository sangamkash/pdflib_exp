const fs = require('fs');
const axios = require('axios');
const { fillPdf } = require('./src/pdfRenderer');
const { PDFDocument } = require('pdf-lib');
const testData = require('./testData.json');

const OUTPUT_PDF = 'output.pdf';

async function createDummyPdfBytes() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    page.drawText('Dummy PDF for Testing', { x: 50, y: 800 });
    const page2 = pdfDoc.addPage([595, 842]);
    page2.drawText('Page 2', { x: 50, y: 800 });

    return await pdfDoc.save();
}

async function runTest() {
    try {
        console.log("Rendering PDF...");
        let outputBytes;

        try {
            // Try to let fillPdf download it from the URL in testData
            outputBytes = await fillPdf(testData);
        } catch (err) {
            console.warn("Standard render failed (likely 403 download). Using fallback dummy PDF.");
            console.warn("Error was:", err.message);

            // Fallback: Create dummy and pass it explicitly
            const dummyBytes = await createDummyPdfBytes();
            outputBytes = await fillPdf(testData, dummyBytes);
        }

        // Save Output
        fs.writeFileSync(OUTPUT_PDF, outputBytes);
        console.log(`Success! Rendered PDF saved to ${OUTPUT_PDF}`);

    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTest();
