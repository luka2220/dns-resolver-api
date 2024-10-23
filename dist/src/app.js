'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
Object.defineProperty(exports, '__esModule', { value: true });
const main_1 = require('./encoding/main');
const udp_1 = require('./udp');
// List of dns servers and hostnames for testing
const dnsServers = {
    cloudflare: {
        hostname: 'one.one.one.one',
        ipAddress: '1.1.1.1',
    },
    google: {
        hostname: 'dns.google.com',
        ipAddress: '8.8.8.8',
    },
    opendns: {
        hostname: 'resolver1.opendns.com',
        ipAddress: '208.67.222.222',
    },
    quad9: {
        hostname: 'dns.quad9.net',
        ipAddress: '9.9.9.9',
    },
    verisign: {
        hostname: 'public-dns-a.verisign.com',
        ipAddress: '64.6.64.6',
    },
    comodo: {
        hostname: 'recursive.resolver.comodo.net',
        ipAddress: '8.26.56.26',
    },
};
const run = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        console.log('DNS resolver running 👾\n');
        let googleTest = {
            id: 22,
            flags: 0x0100,
            numQuestions: 1,
            ansCount: 0,
            nscount: 0,
            arcount: 0,
            question: (0, main_1.encodeHostname)(dnsServers.google.hostname),
            tquery: 1,
            cquery: 1,
        };
        // NOTE: Test to bve able to query one of the root name servers
        // so we can resolve any host and domain name, not just Google’s.
        // Bit recusion must be 0, so flags are set to 0
        // Testing with cloudfare DNS: one.one.one.one
        let cloudflareTest = {
            id: 22,
            flags: 0x0000,
            numQuestions: 1,
            ansCount: 0,
            nscount: 0,
            arcount: 0,
            question: (0, main_1.encodeHostname)(
                dnsServers.cloudflare.hostname,
            ),
            tquery: 2,
            cquery: 1,
        };
        // const msg1 = createDNSMessageBuffer(googleTest);
        // await sendDNSMessageUDP(msg1, dnsServers.cloudflare.ipAddress, 53);
        const msg2 = (0, main_1.createDNSMessageBuffer)(cloudflareTest);
        yield (0, udp_1.sendDNSMessageUDP)(
            msg2,
            dnsServers.cloudflare.ipAddress,
            53,
        );
    });
run();
