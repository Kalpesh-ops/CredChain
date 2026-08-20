const PREFIX = "data:application/json;base64,";

export interface CredentialMetadata {
  holder: string;
  title: string;
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(base64: string): string {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeCredential(metadata: CredentialMetadata): string {
  return PREFIX + toBase64(JSON.stringify(metadata));
}

/** Returns null for any URI that is not a credential payload we wrote. */
export function decodeCredential(uri: string): CredentialMetadata | null {
  if (!uri.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(fromBase64(uri.slice(PREFIX.length)));
    if (typeof parsed?.holder !== "string" || typeof parsed?.title !== "string") {
      return null;
    }
    return { holder: parsed.holder, title: parsed.title };
  } catch {
    return null;
  }
}
