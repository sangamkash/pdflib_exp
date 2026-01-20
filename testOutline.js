const { renderElements } = require('./src/pdfRenderer');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function testOutline() {
    try {
        console.log("Creating dummy PDF...");
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const pdfBytes = await pdfDoc.save();

        const elements = [
            {
                type: 'text',
                content: 'Regular Text',
                position: { x: 50, y: 50 },
                scale: 2,
                color: '#000000'
            },
            {
                type: 'text',
                content: 'Outlined Text (Red Outline, 2px)',
                position: { x: 50, y: 150 },
                scale: 2,
                color: '#FFFFFF', // White fill
                outlineColor: '#FF0000', // Red outline
                outlineWidth: 2
            },
            {
                type: 'text',
                content: 'Bold-ish Text (Black Outline, 0.5px)',
                position: { x: 50, y: 250 },
                scale: 2,
                color: '#000000',
                outlineColor: '#000000',
                outlineWidth: 0.5
            }
        ];

        console.log("Rendering elements with outline...");
        const modifiedPdf = await renderElements(elements, pdfBytes);

        fs.writeFileSync('output_outline.pdf', modifiedPdf);
        console.log("Success! Saved to output_outline.pdf");

    } catch (error) {
        console.error("Error testing outline:", error);
    }
}

testOutline();
