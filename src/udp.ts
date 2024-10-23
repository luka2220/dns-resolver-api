// NOTE: Creates a UDP client to send our DNS message to a name server
import * as dgram from 'dgram';
import { parseServerResponse } from './encoding';

export function sendDNSMessageUDP(
    message: Buffer,
    address: string,
    port: number,
): Promise<void> {
    const client = dgram.createSocket('udp4');

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
