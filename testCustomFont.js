const { renderElements } = require('./src/pdfRenderer');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function testCustomFont() {
    try {
        console.log("Creating dummy PDF...");
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const pdfBytes = await pdfDoc.save();

        const elements = [
            {
                type: 'text',
                content: 'Hello with standard font',
                position: { x: 50, y: 50 },
                font: 'Helvetica',
                scale: 2
            },
            {
                type: 'text',
                content: 'Hello with Custom Font (Roboto)',
                position: { x: 50, y: 150 },
                // Using a public URL for Ubuntu-R.ttf from Hopding/pdf-lib repo assets
                font: 'https://raw.githubusercontent.com/Hopding/pdf-lib/master/assets/fonts/ubuntu/Ubuntu-R.ttf',
                scale: 2,
                color: '#FF0000'
            }
        ];

        console.log("Rendering elements with custom font...");
        const modifiedPdf = await renderElements(elements, pdfBytes);

        fs.writeFileSync('output_custom_font.pdf', modifiedPdf);
        console.log("Success! Saved to output_custom_font.pdf");

    } catch (error) {
        console.error("Error testing custom font:", error);
    }
}

testCustomFont();
