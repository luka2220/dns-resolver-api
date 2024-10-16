import { encodeHostname, createDNSMessageBuffer } from './encoding';
import { sendDNSMessageUDP } from './udp';
import { DNSMessage } from './types';

const run = async () => {
    console.log('DNS resolver running 👾\n');

    let tc1: DNSMessage = {
        id: 22,
        flags: 0x0100,
        numQuestions: 1,
        ansCount: 0,
        nscount: 0,
        arcount: 0,
        question: encodeHostname('dns.google.com'),
        tquery: 1,
        cquery: 1,
    };

    const msg1 = createDNSMessageBuffer(tc1);
    await sendDNSMessageUDP(msg1);
};

run();
