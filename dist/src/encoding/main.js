'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createDNSMessageBuffer = createDNSMessageBuffer;
exports.encodeHostname = encodeHostname;
exports.parseServerResponse = parseServerResponse;
exports.parseDNSHeader = parseDNSHeader;
exports.parseDNSQuestion = parseDNSQuestion;
exports.parseDNSResourceRecord = parseDNSResourceRecord;
const buffer_1 = require('buffer');
// NOTE: Utility function for reading n bytes from the buffer, and increasing the position n bytes
function readNBytes(n, buf, state) {
    const bRead = buf.readUIntBE(state.pos, n);
    state.pos += n;
    return bRead;
}
// NOTE: Creates a message buffer to store the DNS message being sent
// Allocates 12 bytes for the header plus the length of the question
function createDNSMessageBuffer(message) {
    const msgBuffer = buffer_1.Buffer.alloc(16 + message.question.length);
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
function encodeHostname(q) {
    const arr = q.split('.');
    const parts = [];
    arr.forEach((label) => {
        const len = buffer_1.Buffer.from([label.length]);
        const labelBuffer = buffer_1.Buffer.from(label);
        parts.push(len, labelBuffer);
    });
    parts.push(buffer_1.Buffer.from([0x00]));
    return buffer_1.Buffer.concat(parts);
}
// NOTE: Parse through the servers response message and display the import data
function parseServerResponse(response) {
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
    const query = { type: 0 };
    for (let i = 0; i < responseHeader.numQuestions; i++) {
        console.log(`Question ${i + 1}`);
        const questionSection = parseDNSQuestion(response, state.pos);
        for (const [k, v] of Object.entries(questionSection)) {
            console.log(`${k}: ${v}`);
        }
        state.pos = questionSection.currentPosition;
        query.type = questionSection.queryType;
    }
    // Check the question response type
    // Type 1 - A record
    // Type 2 - NS record
    switch (query.type) {
        case 1:
            console.log('\nServer DNS answer response: ');
            for (let i = 0; i < responseHeader.ansCount; i++) {
                console.log(`Answer ${i + 1}`);
                const answerSection = parseDNSResourceRecord(
                    response,
                    state.pos,
                );
                for (const [k, v] of Object.entries(answerSection)) {
                    console.log(`${k}: ${v}`);
                }
                state.pos = answerSection.currentPosition;
            }
            break;
        case 2:
            console.log(`\nServer DNS NS record response`);
            for (let i = 0; i < responseHeader.nscount; i++) {
                console.log(`\nNS Record ${i + 1}`);
                const answerSection = parseDNSResourceRecord(
                    response,
                    state.pos,
                );
                for (const [k, v] of Object.entries(answerSection)) {
                    console.log(`${k}: ${v}`);
                }
                state.pos = answerSection.currentPosition;
            }
            break;
    }
}
// NOTE: Parses the header section of the DNS response, 12 bytes (0 - 11)
// For the flags we shift the bits based on the bit length for each field
// as per RFC 1035 4.1.1 and use the bitwise AND operation to extract
// specific bits from the result
function parseDNSHeader(buf) {
    const flags = buf.readInt16BE(2);
    return {
        id: buf.readUInt16BE(0),
        flags: {
            qr: (flags >> 15) & 1,
            opcode: (flags >> 11) & 15,
            aa: (flags >> 10) & 1,
            tc: (flags >> 9) & 1,
            rd: (flags >> 8) & 1,
            ra: (flags >> 7) & 1,
            z: (flags >> 4) & 7,
            rcode: flags & 15,
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
function parseDNSQuestion(buf, currentPosition) {
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
    const parsedQuestion = {
        qname: label,
        queryType: buf.readUInt16BE(pos),
        queryClass: buf.readUInt16BE(pos + 2), // adv. the pos 2 bytes ahead
        currentPosition: pos + 4, // adv. the pos 4 bytes ahead
    };
    return parsedQuestion;
}
// NOTE: Parses out the resource record of the DNS response for the answer, additional, and resource record sections
function parseDNSResourceRecord(response, currentPosition) {
    const state = { pos: currentPosition };
    let rdlength = 0;
    const answer = {
        name: readNBytes(2, response, state),
        type: readNBytes(2, response, state),
        class: readNBytes(2, response, state),
        ttl: readNBytes(4, response, state),
        rdlength: (() => {
            rdlength = readNBytes(2, response, state);
            return rdlength;
        })(),
        rdata_ipAdd: (() => {
            const raw = response.subarray(state.pos, state.pos + rdlength);
            state.pos += rdlength;
            return cleanResourceIP(raw);
        })(),
        currentPosition: state.pos,
    };
    return answer;
}
// NOTE: Helper function for cleaning the RDATA resource record
function cleanResourceIP(buf) {
    const ipAddress = Array.from(buf).join('.');
    return ipAddress;
}
