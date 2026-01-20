const fs = require('fs');
const { renderElements } = require('./src/pdfRenderer');
const { PDFDocument } = require('pdf-lib');

const OUTPUT_PDF = 'output_elements.pdf';

const elementsData = [
    {
        "type": "text",
        "id": "txt_001",
        "content": "BattleBugz!",
        "color": "#0000FF", // Changed to Blue for visibility on white
        "outlineColor": "#000000",
        "rotation": 15,
        "scale": 1.5,
        "font": "HelveticaBold",
        "position": {
            "x": 120,
            "y": 80
        }
    },
    {
        "type": "image",
        "id": "img_001",
        "src": "https://raw.githubusercontent.com/sangamkash/PortfolioData/refs/heads/main/hike_logo.png",//"https://dummyimage.com/150x150/000/fff.png&text=Logo",
        "rotation": 0,
        "scale": 1,
        "opacity": 0.5,
        "position": {
            "x": 300,
            "y": 200
        }
    },
    {
        "type": "text",
        "id": "txt_002",
        "content": "Win real rewards 🎁",
        "color": "#FFCC00",
        "rotation": 0,
        "scale": 1.9,
        "font": "TimesRoman",
        "opacity": 0.8,
        "position": {
            "x": 140,
            "y": 360
        }
    },
    {
        "type": "text",
        "id": "txt_003",
        "content": "Outline",
        "color": "#00F731",
        "outlineColor": "#000CF7",
        "rotation": 0,
        "scale": 3,
        "font": "Courier",
        "position": {
            "x": 140,
            "y": 460
        }
    },
    {
        "type": "text",
        "id": "txt_004",
        "content": "Outline",
        "color": "#F700DE",
        "outlineColor": "#000CF7",
        "rotation": 0,
        "scale": 2.8,
        "font": "HelveticaOblique",
        "position": {
            "x": 145,
            "y": 460
        }
    },
    {
        "type": "image",
        "id": "img_002",
        "src": "https://dummyimage.com/100x100/ffcc00/000.png&text=Coin",
        "rotation": 45,
        "scale": 1.5,
        "opacity": 0.3,
        "position": {
            "x": 450,
            "y": 180
        }
    }
];

async function createDummyPdfBytes() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    page.drawText('Original PDF Content', { x: 50, y: 800, size: 20 });
    return await pdfDoc.save();
}

async function runTest() {
    try {
        console.log("Generating dummy PDF...");
        const dummyBuffer = await createDummyPdfBytes();

        console.log("Rendering Elements...");
        const outputBytes = await renderElements(elementsData, dummyBuffer);

        fs.writeFileSync(OUTPUT_PDF, outputBytes);
        console.log(`Success! Rendered PDF saved to ${OUTPUT_PDF}`);

    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTest();
