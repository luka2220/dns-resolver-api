'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const encoding_1 = require('./encoding');
const run = () => {
    console.log('DNS resolver running 👾\n');
    let tc1 = {
        id: 22,
        flags: 0x0100,
        numQuestions: 1,
        ancount: 0,
        nscount: 0,
        arcount: 0,
        question: (0, encoding_1.encodeHostname)('dns.google.com'),
        tquery: 1,
        cquery: 1,
    };
    let result = (0, encoding_1.createDNSMessageBuffer)(tc1);
    console.log(`Result of encoded DNS message: ${result.toString('hex')}`);
};
run();
