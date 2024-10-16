// NOTE: Creates a UDP client to send our DNS message to a name server
import * as dgram from 'dgram';
import { parseServerResponse } from './encoding';

const client = dgram.createSocket('udp4');

export function sendDNSMessageUDP(message: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
        client.on('message', (msg, info) => {
            parseServerResponse(msg);
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

        client.send(message, 53, '8.8.8.8', (error) => {
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
