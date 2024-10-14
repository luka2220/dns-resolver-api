// NOTE: Creates a UDP client to send our DNS message to a name server
import * as dgram from 'dgram';

const client = dgram.createSocket('udp4');

client.on('message', (msg, info) => {
    console.log('Data received from server : ' + msg.toString('hex'));
    console.log(
        'Received %d bytes from %s:%d\n',
        msg.length,
        info.address,
        info.port,
    );

    client.close(() => {
        console.log('Connection closed');
    });
});

export function sendDNSMessageUDP(message: Buffer) {
    client.send(message, 53, '8.8.8.8', (error) => {
        if (error) {
            console.log(`An error occured: ${error}`);
            client.close();
        } else {
            console.log(`Sent message: ${message.toString('hex')}`);
        }
    });
}
