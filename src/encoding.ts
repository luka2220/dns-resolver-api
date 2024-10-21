import { Buffer } from 'buffer';
import {
    DNSMessage,
    DNSHeaderSection,
    DNSQuestionSection,
    DNSAnswerSection,
} from './types';

// NOTE: Utility function for reading n bytes from the buffer, and increasing the position n bytes
function readNBytes(n: number, buf: Buffer, state: { pos: number }): number {
    const bRead = buf.readUIntBE(state.pos, n);
    state.pos += n;
    return bRead;
}

// NOTE: Creates a message buffer to store the DNS message being sent
// Allocates 12 bytes for the header plus the length of the question
export function createDNSMessageBuffer(message: DNSMessage): Buffer {
    const msgBuffer = Buffer.alloc(16 + message.question.length);

    msgBuffer.writeUInt16BE(message.id, 0);
    msgBuffer.writeUInt16BE(message.flags, 2);
    msgBuffer.writeUInt16BE(message.numQuestions, 4);
    msgBuffer.writeUInt16BE(message.ansCount, 6);
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

// NOTE: Parse through the servers response message and display the import data
export function parseServerResponse(response: Buffer) {
    console.log(`Server response = ${response.toString('hex')}`);
    const state = { pos: 12 }; // buffer read position set to 12 to use after parsing the header section

    console.log('\nServer DNS header response: ');
    const responseHeader = parseDNSHeader(response);
    for (const [k, v] of Object.entries(responseHeader)) {
        if (k == 'flags') {
            for (const [fk, fv] of Object.entries(responseHeader[k])) {
                console.log(`flags[${fk}]: ${fv}`);
            }
        } else {
            console.log(`${k}: ${v}`);
        }
    }

    console.log('\nServer DNS question response: ');
    for (let i = 0; i < responseHeader.numQuestions; i++) {
        console.log(`Question ${i + 1}`);

        const questionSection = parseDNSQuestion(response, state.pos);
        for (const [k, v] of Object.entries(questionSection)) {
            console.log(`${k}: ${v}`);
        }

        state.pos = questionSection.currentPosition;
    }

    console.log('\nServer DNS answer response: ');
    for (let i = 0; i < responseHeader.ansCount; i++) {
        console.log(`Answer ${i + 1}`);

        const answerSection = parseDNSAnswer(response, state.pos);
        for (const [k, v] of Object.entries(answerSection)) {
            console.log(`${k}: ${v}`);
        }

        state.pos = answerSection.currentPosition;
    }
}

// NOTE: Parses the header section of the DNS response, 12 bytes (0 - 11)
export function parseDNSHeader(buf: Buffer): DNSHeaderSection {
    const flags = buf.readInt16BE(2);
    return {
        id: buf.readUInt16BE(0),
        flags: {
            qr: (flags & 0x8000) >> 15,
            opcode: (flags & 0x7800) >> 11,
            aa: (flags & 0x0400) >> 10,
            tc: (flags & 0x0200) >> 9,
            rd: (flags & 0x0100) >> 8,
            ra: (flags & 0x0080) >> 7,
            z: (flags & 0x0070) >> 4,
            rcode: flags & 0x000f,
        },
        numQuestions: buf.readUInt16BE(4),
        ansCount: buf.readUInt16BE(6),
        nscount: buf.readUInt16BE(8),
        arcount: buf.readUInt16BE(10),
    };
}

// NOTE: Parses out the question section of the DNS response message
// The questions section starts at position 12 in the buffer since the
// header secction take up the first 12 bytes (0 - 11)
export function parseDNSQuestion(
    buf: Buffer,
    currentPosition: number,
): DNSQuestionSection {
    let pos = currentPosition;
    let label = '';

    while (true) {
        const byteLength = buf.readUIntBE(pos, 1);
        pos += 1;

        if (byteLength == 0) {
            break;
        }

        if (label.length > 0) {
            label += '.';
        }

        for (let i = 0; i < byteLength; i++) {
            label += String.fromCharCode(buf.readUIntBE(pos, 1));
            pos += 1;
        }
    }

    const parsedQuestion: DNSQuestionSection = {
        qname: label,
        queryType: buf.readUInt16BE(pos),
        queryClass: buf.readUInt16BE(pos + 2), // adv. the pos 2 bytes ahead
        currentPosition: pos + 4, // adv. the pos 4 bytes ahead
    };

    return parsedQuestion;
}

// NOTE: Parses out the answer section of the DNS response
export function parseDNSAnswer(
    response: Buffer,
    currentPosition: number,
): DNSAnswerSection {
    const state = { pos: currentPosition };
    let rdlength = 0;

    const answer: DNSAnswerSection = {
        name: readNBytes(2, response, state),
        type: readNBytes(2, response, state),
        class: readNBytes(2, response, state),
        ttl: readNBytes(4, response, state),
        rdlength: ((): number => {
            rdlength = readNBytes(2, response, state);
            return rdlength;
        })(),
        rdata_ipAdd: ((): string => {
            const raw = response.subarray(state.pos, state.pos + rdlength);
            state.pos += rdlength;
            return raw.toString('hex');
        })(),
        currentPosition: state.pos,
    };

    return answer;
}
