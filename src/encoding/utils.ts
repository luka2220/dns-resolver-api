import { Buffer } from 'buffer';

// NOTE: Utility function for reading n bytes from the buffer, and increasing the position n bytes
export function readNBytes(
    n: number,
    buf: Buffer,
    state: { pos: number },
): number {
    const bRead = buf.readUIntBE(state.pos, n);
    state.pos += n;
    return bRead;
}

// NOTE: Helper function for cleaning the RDATA resource record
export function cleanResourceIP(buf: Buffer): string {
    const ipAddress = Array.from(buf).join('.');
    return ipAddress;
}

export function cleanNSrecord_ip(buf: Buffer): string {
    return buf.toString('hex');
}
