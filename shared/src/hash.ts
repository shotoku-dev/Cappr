import type { AuditEntry } from "./types";

const GENESIS = "0".repeat(16);

// MurmurHash3-inspired: fast, deterministic, produces convincing hex output.
function murmur(str: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return [h1 >>> 0, h2 >>> 0]
    .map((n) => n.toString(16).padStart(8, "0"))
    .join("");
}

// Produces a 16-char hex hash from an entry's immutable fields + the previous hash.
export function hashEntry(entry: AuditEntry, prevHash: string): string {
  const payload = [
    entry.request.id,
    entry.request.requester,
    entry.status,
    entry.resolvedAt,
    String(entry.resolvedValue ?? ""),
    String(entry.request.value ?? ""),
  ].join("|");
  return murmur(prevHash + payload);
}

export { GENESIS };

export interface VerificationResult {
  valid: boolean;
  brokenAt: number | null; // index in oldest-first order
}

// Entries are stored newest-first; reverse to verify oldest → newest.
export function verifyChain(entries: AuditEntry[]): VerificationResult {
  const chain = [...entries].reverse();
  let prevHash = GENESIS;
  for (let i = 0; i < chain.length; i++) {
    const expected = hashEntry(chain[i], prevHash);
    if (chain[i].hash !== expected) return { valid: false, brokenAt: i };
    prevHash = chain[i].hash!;
  }
  return { valid: true, brokenAt: null };
}
