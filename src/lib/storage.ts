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
  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `${tenantId}/${folder}/${Date.now()}-${safe}`;
  const blob = await put(pathname, bytes, { access: 'public', addRandomSuffix: false });
  return { url: blob.url, pathname: blob.pathname, fileName: file.name };
}

/** Resolve pdf-parse with CJS/ESM interop (avoids static default-export error). */
async function pdfText(bytes: Buffer): Promise<string> {
  const mod: any = await import('pdf-parse');
  const parser = mod.default || mod.PDFParse || mod;
  const res = await parser(bytes);
  return (res && res.text) || '';
}

/** Extract text from a PDF/DOCX/TXT/MD file. Returns '' on any failure. */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    if (name.endsWith('.pdf')) {
      return await pdfText(bytes);
    }
    if (name.endsWith('.docx')) {
      const res = await mammoth.extractRawText({ buffer: bytes });
      return res.value || '';
    }
    if (name.endsWith('.doc')) {
      return '(Format .doc lama tidak didukung otomatis — silakan konversi ke .docx atau PDF, lalu gunakan tempel teks.)';
    }
    return bytes.toString('utf8');
  } catch {
    return '';
  }
}
