import { DNSMessage, encodeHostname, createDNSMessageBuffer } from "./encoding";

const run = () => {
    console.log('DNS resolver running 👾\n');

    let tc1: DNSMessage = {
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
