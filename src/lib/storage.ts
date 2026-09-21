import { put } from '@vercel/blob';
import mammoth from 'mammoth';

interface StoredFile {
  url: string;
  pathname: string;
  fileName: string;
}

/** Upload a File to Vercel Blob under a tenant-scoped prefix. */
export async function storeFile(
  tenantId: string,
  folder: string,
  file: File,
): Promise<StoredFile> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN belum dikonfigurasi (cek environment variables)');
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `${tenantId}/${folder}/${Date.now()}-${safe}`;
  const blob = await put(pathname, bytes, { access: 'public', addRandomSuffix: false });
  return { url: blob.url, pathname: blob.pathname, fileName: file.name };
}

/**
 * Resolve PDF text via pdf-parse.
 * pdf-parse v2 exposes the `PDFParse` class (new PDFParse({ data }) + getText());
 * interop with v1 (callable default export) is kept defensively.
 */
async function pdfText(bytes: Buffer): Promise<string> {
  const mod: any = await import('pdf-parse');
  const PdfParser = mod.PDFParse ?? mod.default;
  const parser = new PdfParser({ data: new Uint8Array(bytes) });
  try {
    const res = typeof parser.getText === 'function' ? await parser.getText() : await parser;
    return (res && res.text) || '';
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy().catch(() => {});
    }
  }
}

/** Extract text from a PDF/DOCX/TXT/MD file. Throws on failure so callers can report it. */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const bytes = Buffer.from(await file.arrayBuffer());
  if (name.endsWith('.pdf')) {
    return (await pdfText(bytes)).trim();
  }
  if (name.endsWith('.docx')) {
    const res = await mammoth.extractRawText({ buffer: bytes });
    return (res.value || '').trim();
  }
  if (name.endsWith('.doc')) {
    return '(Format .doc lama tidak didukung otomatis — silakan konversi ke .docx atau PDF, lalu gunakan tempel teks.)';
  }
  return bytes.toString('utf8');
}
