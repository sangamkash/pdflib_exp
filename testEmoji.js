const { renderElements } = require('./src/pdfRenderer');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

// URL for Noto Color Emoji or similar. 
// Note: Noto Color Emoji is very large (standard 10MB+) and might be slow to download or process. 
// A smaller font with some emoji support or a subsetted font is better for testing.
// However, Noto Emoji (B&W) is smaller.
const FONT_URL = "https://github.com/googlefonts/noto-emoji/blob/main/fonts/NotoEmoji-Regular.ttf?raw=true";

async function testEmoji() {
    try {
        console.log("Creating dummy PDF for Emoji Test...");
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const pdfBytes = await pdfDoc.save();

        const elements = [
            {
                type: 'text',
                content: 'Hello World (Standard Font)',
                position: { x: 50, y: 50 },
                scale: 1,
                color: '#000000'
            },
            {
                type: 'text',
                content: 'Emoji Test: Hello 🌍 (Custom Font)',
                position: { x: 50, y: 150 },
                scale: 1.5,
                color: '#000000',
                font: FONT_URL
            }
        ];

        console.log("Rendering elements with Emoji...");
        const modifiedPdf = await renderElements(elements, pdfBytes);

        fs.writeFileSync('output_emoji.pdf', modifiedPdf);
        console.log("Success! Saved to output_emoji.pdf");

    } catch (error) {
        console.error("Error testing emoji:", error);
    }
}

testEmoji();
