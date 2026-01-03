import mammoth from 'mammoth';
const pdf = require('pdf-parse');

export async function parseResumeFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === 'application/pdf') {
        try {
            const data = await pdf(buffer);
            return data.text;
        } catch (e) {
            console.error("PDF Parse Error", e);
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
