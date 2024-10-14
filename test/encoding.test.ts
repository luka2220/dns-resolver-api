import { describe, it, expect } from 'vitest';
import { DNSMessage, createDNSMessageBuffer, encodeHostname } from '../src/encoding';

describe('encodeHostname', () => {
    it('should encode a hostname string correctly', () => {
        const input = 'dns.google.com';
        const expected = Buffer.from([
            3, 100, 110, 115, 6, 103, 111, 111, 103, 108, 101, 3, 99, 111, 109,
            0,
        ]);

        const result = encodeHostname(input);

        expect(result).toEqual(expected);
    });

    it('should encode a single label hostname', () => {
        const input = 'localhost';
        const expected = Buffer.from([
            9, 108, 111, 99, 97, 108, 104, 111, 115, 116, 0,
        ]);

        const result = encodeHostname(input);

        expect(result).toEqual(expected);
    });
});

const dnsMessageCase1: DNSMessage = {
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

const dnsMessageCase2: DNSMessage = {
    id: 33,
    flags: 0x0100,
    numQuestions: 1,
    ancount: 0,
    nscount: 0,
    arcount: 0,
    question: encodeHostname('example.com'),
    tquery: 1,
    cquery: 1,
};

describe('createDNSMessageBuffer', () => {
    it('should encode the dns message correctly for dns.google.com', () => {
        const expectedHex =
            '00160100000100000000000003646e7306676f6f676c6503636f6d0000010001';
        const actualBuffer = createDNSMessageBuffer(dnsMessageCase1);
        const actualHex = actualBuffer.toString('hex');
        expect(actualHex).toBe(expectedHex);
    });

    it('should encode the dns message correctly for example.com', () => {
        const expectedHex =
            '002101000001000000000000076578616d706c6503636f6d0000010001';
        const actualBuffer = createDNSMessageBuffer(dnsMessageCase2);
        const actualHex = actualBuffer.toString('hex');
        expect(actualHex).toBe(expectedHex);
    });
});
