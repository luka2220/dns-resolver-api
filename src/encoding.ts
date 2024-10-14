import { Buffer } from 'buffer';

export interface DNSMessage {
    id: number; // Transaction id (typically 22); size: 16bits
    flags: number; // Control flags (set to 1 for recursion desired); 16bits
    numQuestions: number; // Number of questions (set to one since only one is being sent); 16bits
    ancount: 0 | 1; // Answer Rescource Records, set to 0 for sending a query; 16bits
    nscount: number; // Authority Resource Records, set to 0 since we have no auth records; 16bits
    arcount: number; // Additional resource records, set 0 as we have no additional resource records; 16bits
    question: Buffer; // The question as a Buffer type
    tquery: number; // Query type, should be set to 1
    cquery: number; // Query class, set to 1
}

// NOTE: Creates a message buffer to store the DNS message being sent
// Allocates 12 bytes for the header plus the length of the question
export function createDNSMessageBuffer(message: DNSMessage): Buffer {
    const msgBuffer = Buffer.alloc(16 + message.question.length);

    msgBuffer.writeUInt16BE(message.id, 0);
    msgBuffer.writeUInt16BE(message.flags, 2);
    msgBuffer.writeUInt16BE(message.numQuestions, 4);
    msgBuffer.writeUInt16BE(message.ancount, 6);
    msgBuffer.writeUInt16BE(message.nscount, 8);
    msgBuffer.writeUInt16BE(message.arcount, 10);
    message.question.copy(msgBuffer, 12);
    msgBuffer.writeUInt16BE(message.tquery, 12 + message.question.length);
    msgBuffer.writeUInt16BE(message.cquery, 14 + message.question.length);

    return msgBuffer;
}

// NOTE: Encodes the host name string for the name field
// i.e If we are looking up dns.google.com it will be encoded as the following 3dns6google3com0
export function encodeHostname(q: string): Buffer {
    const arr = q.split('.');
    const parts: Buffer[] = [];

    arr.forEach((label) => {
        const len = Buffer.from([label.length]);
        const labelBuffer = Buffer.from(label);
        parts.push(len, labelBuffer);
    });

    parts.push(Buffer.from([0x00]));

    return Buffer.concat(parts);
}
