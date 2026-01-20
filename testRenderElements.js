const fs = require('fs');
const { renderElements } = require('./src/pdfRenderer');
const { PDFDocument } = require('pdf-lib');

const OUTPUT_PDF = 'output_elements.pdf';

const elementsData = [
    {
        "type": "text",
        "id": "txt_001",
        "content": "Abc!",
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
        "scale": 0.5,
        "opacity": 1,
        "position": {
            "x": 300,
            "y": 240
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
        "type": "text",
        "id": "txt_004",
        "content": "This a custom font",
        "color": "#F700DE",
        "outlineColor": "#000CF7",
        "rotation": 0,
        "scale": 2.8,
        "font": "https://raw.githubusercontent.com/google/fonts/main/ofl/rubikstorm/RubikStorm-Regular.ttf",
        "position": {
            "x": 145,
            "y": 660
        }
    },
    {
        "type": "image",
        "id": "img_002",
        "src": "https://dummyimage.com/100x100/ffcc00/000.png&text=Coin",
        "rotation": 45,
        "scale": 1.5,
        "opacity": 1,
        "position": {
            "x": 650,
            "y": 180
        }
    },
    {
        "type": "base64image",
        "id": "img_b64_001",
        "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=",
        "rotation": 0,
        "scale": 2.0,
        "opacity": 1,
        "position": {
            "x": 300,
            "y": 650
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
