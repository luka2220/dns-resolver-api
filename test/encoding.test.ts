import { describe, it, expect } from 'vitest';
import {
    createDNSMessageBuffer,
    encodeHostname,
    parseDNSHeader,
} from '../src/encoding/main';
import { DNSMessage, DNSHeaderSection } from '../src/encoding/types';

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

describe('createDNSMessageBuffer', () => {
    const dnsMessageCase1: DNSMessage = {
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

    const dnsMessageCase2: DNSMessage = {
        id: 33,
        flags: 0x0100,
        numQuestions: 1,
        ansCount: 0,
        nscount: 0,
        arcount: 0,
        question: encodeHostname('example.com'),
        tquery: 1,
        cquery: 1,
    };

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

describe('DNS Header parsing', () => {
    it('Test Case 1 - should properly parse and decode the DNS Header', () => {
        const tc = Buffer.from('123481800001000100000000', 'hex');
        const expected: DNSHeaderSection = {
            id: 4660,
            flags: {
                qr: 1,
                opcode: 0,
                aa: 0,
                tc: 0,
                rd: 1,
                ra: 1,
                z: 0,
                rcode: 0,
            },
            numQuestions: 1,
            ansCount: 1,
            nscount: 0,
            arcount: 0,
        };
        const actual = parseDNSHeader(tc);
        expect(actual).toEqual(expected);
    });

    it('Test Case 2 - should properly parse and decode the DNS header', () => {
        const tc = Buffer.from('ABCD81800001000200000000', 'hex');
        const expected: DNSHeaderSection = {
            id: 43981,
            flags: {
                qr: 1,
                opcode: 0,
                aa: 0,
                tc: 0,
                rd: 1,
                ra: 1,
                z: 0,
                rcode: 0,
            },
            numQuestions: 1,
            ansCount: 2,
            nscount: 0,
            arcount: 0,
        };
        const actual = parseDNSHeader(tc);
        expect(actual).toEqual(expected);
    });

    it('Test Case 3 - should properly parse and decode the DNS header', () => {
        const tc = Buffer.from('567881820001000000000000', 'hex');
        const expected: DNSHeaderSection = {
            id: 22136,
            flags: {
                qr: 1,
                opcode: 0,
                aa: 0,
                tc: 0,
                rd: 1,
                ra: 1,
                z: 0,
                rcode: 2,
            },
            numQuestions: 1,
            ansCount: 0,
            nscount: 0,
            arcount: 0,
        };
        const actual = parseDNSHeader(tc);
        expect(actual).toEqual(expected);
    });

    it('Test Case 4 - should properly parse and decode the DNS header', () => {
        const tc = Buffer.from('9F3481800001000000010000', 'hex');
        const expected: DNSHeaderSection = {
            id: 40756,
            flags: {
                qr: 1,
                opcode: 0,
                aa: 0,
                tc: 0,
                rd: 1,
                ra: 1,
                z: 0,
                rcode: 0,
            },
            numQuestions: 1,
            ansCount: 0,
            nscount: 1,
            arcount: 0,
        };
        const actual = parseDNSHeader(tc);
        expect(actual).toEqual(expected);
    });
});
