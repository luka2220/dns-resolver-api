import { Buffer } from 'buffer';
import * as util from 'util';

// NOTE: Question section for a DNS message
interface QuestionSection {
    domainName: string;
    qtype: number; // Query type set to 1 for standard query
    qclass: number; // Query class set to 1 for internet class
}

interface DNSMessage {
    id: number; // Transaction id (typically 22)
    flags: number; // Control flags (set to 1 for recursion desired)
    numQuestions: number; // Number of questions (set to one since only one is being sent)
    ancount: 0 | 1; // Answer Rescource Records, set to 0 for sending a query
    nscount: number; // Authority Resource Records, set to 0 since we have no auth records
    arcount: number; // Additional resource records, set 0 as we have no additional resource records
    question: QuestionSection; // The question as a Buffer type
}

function encodeDNSMessage(msg: DNSMessage): string {
    let msgString = util.format(
        '%d%d%d%d%d%d%s%d%d',
        msg.id,
        msg.flags,
        msg.numQuestions,
        msg.ancount,
        msg.nscount,
        msg.arcount,
        msg.question.domainName,
        msg.question.qtype,
        msg.question.qclass,
    );

    const buf = Buffer.from(msgString);
    const endcodedMsgHex = buf.toString('hex');

    return endcodedMsgHex;
}

const start = () => {
    console.log('DNS resolver running 👾\n');

    let tc1: DNSMessage = {
        id: 22,
        flags: 1,
        numQuestions: 1,
        ancount: 0,
        nscount: 0,
        arcount: 0,
        question: {
            domainName: '3dns6google3com0',
            qtype: 1,
            qclass: 1,
        },
    };

    let r1: string = encodeDNSMessage(tc1);
    console.log(`DNS message tc1 encoded => ${r1}`);
};

start();
