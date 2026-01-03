import mammoth from 'mammoth';

// Polyfill DOMMatrix for pdf-parse (pdfjs-dist) in Node.js
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor() { }
    };
}

// Use require to avoid "export default" issues with pdf-parse in some setups
let pdf = require('pdf-parse');
// Handle "default" export if bundled as ES module interop
if (typeof pdf !== 'function' && pdf.default) {
    pdf = pdf.default;
}

export async function parseResumeFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === 'application/pdf') {
        try {
            const data = await pdf(buffer);
            // data.text, data.numpages, etc.
            return data.text;
        } catch (e) {
            console.error("PDF Parse Error", e);
            // Fallback or rethrow
            throw new Error("Could not parse PDF text. The file might be encrypted or corrupted.");
        }
    } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
    ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } else {
        throw new Error('Unsupported file type');
    }
}
