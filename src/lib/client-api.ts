'use client';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type ApiInit = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
  formData?: FormData;
};

export async function api<T = unknown>(path: string, init?: ApiInit): Promise<T> {
  let body: BodyInit | undefined = init?.formData;
  let headers: Record<string, string> = {};

  if (init?.formData) {
    body = init.formData;
  } else if (init?.body && typeof init.body === 'object' && !(init.body instanceof FormData) && !(init.body instanceof Blob) && !(init.body instanceof ArrayBuffer) && !ArrayBuffer.isView(init.body)) {
    body = JSON.stringify(init.body);
    headers['Content-Type'] = 'application/json';
  } else if (init?.body) {
    body = init.body as BodyInit;
  }

  const res = await fetch(path, {
    method: init?.method,
    body,
    headers: { ...headers, ...(init?.headers as Record<string, string>) },
  });

  const data = await res.json().catch(() => ({ message: 'Unexpected error' }));
  if (!res.ok) {
    throw new ApiError(data?.message || 'Terjadi kesalahan', res.status);
  }
  return data as T;
}

export function formJson(obj: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (v instanceof File) fd.append(k, v);
    else fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
  }
  return fd;
}
