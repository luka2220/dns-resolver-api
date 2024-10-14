'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.encodeHostname = encodeHostname;
const buffer_1 = require('buffer');
// NOTE: Creates a message buffer to store the DNS message being sent
// Allocates 12 bytes for the header plus the length of the question
function createDNSMessageBuffer(message) {
    const msgBuffer = buffer_1.Buffer.alloc(16 + message.question.length);
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
const run = () => {
    console.log('DNS resolver running 👾\n');
    let tc1 = {
        id: 22,
        flags: 0x0100,
        numQuestions: 1,
        ancount: 0,
        nscount: 0,
        arcount: 0,
        question: encodeHostname('dns.google.com'),
        tquery: 1,
        cquery: 1,
    };
    let result = createDNSMessageBuffer(tc1);
    console.log(`Result of encoded DNS message: ${result.toString('hex')}`);
};
run();
