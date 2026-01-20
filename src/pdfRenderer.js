const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const axios = require('axios');

/**
 * Fills a PDF with data from a JSON object.
 * Fetches the PDF from jsonData.data.presigned_url unless pdfBuffer is provided.
 * @param {object} jsonData - JSON object containing the field definitions and URL.
 * @param {Uint8Array} [pdfBuffer] - Optional buffer of the PDF to use (overrides URL).
 * @returns {Promise<Uint8Array>} - The bytes of the modified PDF.
 */
async function fillPdf(jsonData, pdfBuffer = null) {
    let existingPdfBytes = pdfBuffer;

    if (!existingPdfBytes) {
        // Try to get URL from JSON
        const url = jsonData?.data?.presigned_url;
        if (!url) {
            throw new Error("No PDF URL found in JSON data and no buffer provided.");
        }

        console.log(`Downloading PDF from ${url} ...`);
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'arraybuffer'
            });
            existingPdfBytes = response.data;
        } catch (error) {
            throw new Error(`Failed to download PDF: ${error.message}`);
        }
    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    if (!jsonData || !jsonData.data || !jsonData.data.fields) {
        throw new Error("Invalid JSON data: missing 'data.fields'");
    }

    const fields = jsonData.data.fields;

    for (const field of fields) {
        const pageIndex = field.page - 1; // 1-based to 0-based
        if (pageIndex < 0 || pageIndex >= pages.length) {
            console.warn(`Page ${field.page} out of range for field ${field.id}`);
            continue;
        }

        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        // Convert coordinates from Top-Left (JSON) to Bottom-Left (pdf-lib)
        const x = field.rect_x;
        const y = height - field.rect_y - field.rect_height;

        let valueToRender = field.default_value;
        if (valueToRender === null || valueToRender === undefined) {
            valueToRender = "..";
        }

        if (['TEXT', 'DATETIME', 'EMAIL', 'NAME', 'SIGNATURE'].includes(field.field_type)) {
            const fontSize = field.appearance && field.appearance.size ? field.appearance.size : 12;
            const textY = y + (field.rect_height / 2) - (fontSize / 2);

            page.drawText(String(valueToRender), {
                x: x + 2,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            });
        }
        else if (field.field_type === 'CHECKBOX' || field.field_type === 'RADIO') {
            const fontSize = 10;
            const textY = y + (field.rect_height / 2) - (fontSize / 2);
            page.drawText(String(valueToRender), {
                x: x + 2,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            });
        }
    }

    return await pdfDoc.save();
}

/**
 * Helper to convert Hex color to PDF RGB
 */
function hexToRgb(hex) {
    if (!hex) return rgb(0, 0, 0);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? rgb(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ) : rgb(0, 0, 0);
}

/**
 * Renders elements (text/image) from JSON onto a PDF.
 * @param {Array} elements - Array of elements to render.
 * @param {Uint8Array} pdfBuffer - Buffer of the source PDF.
 * @returns {Promise<Uint8Array>} - The bytes of the modified PDF.
 */
async function renderElements(elements, pdfBuffer) {
    if (!pdfBuffer) {
        throw new Error("PDF Buffer is required");
    }

    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Font mapping
    const fontMap = {
        'Helvetica': StandardFonts.Helvetica,
        'HelveticaBold': StandardFonts.HelveticaBold,
        'TimesRoman': StandardFonts.TimesRoman,
        'Courier': StandardFonts.Courier,
        'Symbol': StandardFonts.Symbol,
        'ZapfDingbats': StandardFonts.ZapfDingbats
        // Add others as needed
    };

    // Cache embedded fonts to avoid re-embedding
    const embeddedFonts = {};

    const pages = pdfDoc.getPages();
    // Assuming single page modification or elements specify page. 
    // The requirement implies "create an output PDF", typically on the first page or existing pages.
    // We'll use the first page for this demo unless specified.
    const page = pages[0];
    const { width, height } = page.getSize();

    for (const element of elements) {
        // Coordinate conversion: Top-Left (JSON) -> Bottom-Left (PDF)
        // We assume element.position.x/y are top-left coordinates.
        // For render, we need to adjust based on element height if possible, 
        // but for simple text/image we'll assume y is the anchor point provided.
        // PDF-Lib Y is from bottom.

        const x = element.position.x;
        // Basic Y flip. 
        // Note: For text, drawText y is baseline. For image, drawImage y is bottom-left.
        // We might need adjustment if visual top-left is strict. 
        // For now, simple flip: y = pageHeight - inputY.
        let y = height - element.position.y;

        const rotation = degrees(element.rotation || 0);
        const scale = element.scale || 1;
        const opacity = element.opacity !== undefined ? element.opacity : 1;

        if (element.type === 'text') {
            const fontSize = 12 * scale; // Base size 12
            const color = hexToRgb(element.color);

            // Font selection
            const fontName = element.font || 'Helvetica';
            let font = embeddedFonts[fontName];

            if (!font) {
                // Check if it's a URL
                if (fontName.startsWith('http://') || fontName.startsWith('https://')) {
                    try {
                        console.log(`Downloading custom font from ${fontName}...`);
                        const fontResponse = await axios({
                            url: fontName,
                            method: 'GET',
                            responseType: 'arraybuffer'
                        });
                        const fontBytes = fontResponse.data;
                        pdfDoc.registerFontkit(fontkit);
                        font = await pdfDoc.embedFont(fontBytes);
                        embeddedFonts[fontName] = font;
                    } catch (err) {
                        console.error(`Failed to load custom font ${fontName}: ${err.message}`);
                        // Fallback to Helvetica
                        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                    }
                } else {
                    const stdFont = fontMap[fontName] || StandardFonts.Helvetica;
                    font = await pdfDoc.embedFont(stdFont);
                    embeddedFonts[fontName] = font;
                }
            }

            // Adjust Y for text to be somewhat top-aligned if inputY was top.
            // drawText draws at baseline. To make inputY the "top", we subtract roughly the font height/ascender.
            // But usually simple inversion is a good start. 
            // Let's stick to y - fontSize to try to approximate top-left anchor.
            // Actually, simpler is just y. User can adjust. 
            // Let's use y - fontSize to emulate "Top-Left" anchor roughly.
            const drawY = y - fontSize;

            // StandardFonts only support WinAnsi (approx Latin-1). 
            // We need to strip or replace unsupported characters (like emojis) to prevent crash.
            const sanitizedContent = element.content.replace(/[^\x00-\xFF]/g, '');
            if (sanitizedContent !== element.content) {
                console.warn(`Warning: Some characters in text "${element.content}" were stripped because they are not supported by the standard font.`);
            }

            page.drawText(sanitizedContent, {
                x: x,
                y: drawY,
                size: fontSize,
                font: font,
                color: color,
                rotate: rotation,
                opacity: opacity,
            });
        } else if (element.type === 'image') {
            try {
                const response = await axios({
                    url: element.src,
                    method: 'GET',
                    responseType: 'arraybuffer'
                });
                const imageBytes = response.data;

                const contentType = response.headers['content-type'];

                let embeddedImage;
                if (contentType === 'image/png' || element.src.toLowerCase().includes('.png')) {
                    embeddedImage = await pdfDoc.embedPng(imageBytes);
                } else if (contentType === 'image/jpeg' || contentType === 'image/jpg' || element.src.toLowerCase().includes('.jpg') || element.src.toLowerCase().includes('.jpeg')) {
                    embeddedImage = await pdfDoc.embedJpg(imageBytes);
                } else {
                    // Fallback try PNG then JPG
                    try {
                        embeddedImage = await pdfDoc.embedPng(imageBytes);
                    } catch (e) {
                        embeddedImage = await pdfDoc.embedJpg(imageBytes);
                    }
                }

                const imgDims = embeddedImage.scale(scale);

                // Image draw y is bottom-left of image. 
                // If inputY is top of image, then y_pdf = (height - inputY) - imageHeight.
                const drawY = y - imgDims.height;

                page.drawImage(embeddedImage, {
                    x: x,
                    y: drawY,
                    width: imgDims.width,
                    height: imgDims.height,
                    rotate: rotation,
                    opacity: opacity,
                });
            } catch (err) {
                console.error(`Failed to load/render image ${element.id}: ${err.message}`);
            }
        } else if (element.type === 'base64image') {
            try {
                const dataUri = element.src;
                const matches = dataUri.match(/^data:(.+);base64,(.+)$/);

                if (!matches || matches.length !== 3) {
                    throw new Error('Invalid base64 string format');
                }

                const contentType = matches[1];
                const b64Data = matches[2];
                const imageBytes = Buffer.from(b64Data, 'base64');

                let embeddedImage;
                if (contentType === 'image/png') {
                    embeddedImage = await pdfDoc.embedPng(imageBytes);
                } else if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
                    embeddedImage = await pdfDoc.embedJpg(imageBytes);
                } else {
                    // Fallback try PNG then JPG if content type isn't explicit standard
                    try {
                        embeddedImage = await pdfDoc.embedPng(imageBytes);
                    } catch (e) {
                        embeddedImage = await pdfDoc.embedJpg(imageBytes);
                    }
                }

                const imgDims = embeddedImage.scale(scale);
                const drawY = y - imgDims.height;

                page.drawImage(embeddedImage, {
                    x: x,
                    y: drawY,
                    width: imgDims.width,
                    height: imgDims.height,
                    rotate: rotation,
                    opacity: opacity,
                });

            } catch (err) {
                console.error(`Failed to load/render base64image ${element.id}: ${err.message}`);
            }
        }
    }

    return await pdfDoc.save();
}

module.exports = { fillPdf, renderElements };
