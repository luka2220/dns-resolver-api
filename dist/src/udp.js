'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.sendDNSMessageUDP = sendDNSMessageUDP;
// NOTE: Creates a UDP client to send our DNS message to a name server
const dgram = require('dgram');
const main_1 = require('./encoding/main');
function sendDNSMessageUDP(message, address, port) {
    const client = dgram.createSocket('udp4');
    return new Promise((resolve, reject) => {
        client.on('message', (msg, info) => {
            (0, main_1.parseServerResponse)(msg);
            console.log(
                '\nMessage Info: \nReceived %d bytes from %s:%d\n',
                msg.length,
                info.address,
                info.port,
            );
            client.close(() => {
                console.log('Connection closed');
                resolve();
            });
        });
        client.send(message, port, address, (error) => {
            if (error) {
                console.log(`An error occured: ${error}`);
                client.close();
                reject(error);
            } else {
                console.log(`Sent message: ${message.toString('hex')}`);
            }
        });
    });
}
