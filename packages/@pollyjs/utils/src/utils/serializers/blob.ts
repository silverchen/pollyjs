export const supportsBlob = (() => {
  try {
    return !!new Blob();
  } catch (e) {
    return false;
  }
})();

export function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = reject;
    reader.onabort = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(new Blob([blob], { type: blob.type }));
  });
}

export async function serialize(body: any) {
  if (supportsBlob && body instanceof Blob) {
    return await readBlob(body);
  }

  return body;
}
