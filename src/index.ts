import express from 'express';
import makeWASocket, { DisconnectReason, BufferJSON, useSingleFileAuthState } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import * as fs from 'fs'

const { state, saveState } = useSingleFileAuthState('./DRXSports.json')

const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    version: [2, 2204, 13],
})

sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
        if (shouldReconnect) {
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
        }
    } else if (connection === 'open') {
        console.log('opened connection')
    }
})

sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.key.fromMe && m.type === 'notify') {
        await sock.sendPresenceUpdate('available', msg.key.remoteJid!)
        await sock.sendReadReceipt(msg.key.remoteJid!, msg.key.participant!, [msg.key.id!])
        await sock.sendMessage(msg.key.remoteJid!, { text: "Desculpe esse telefone não é monitorado, por favor procure o suporte!\n" + Date() })
    }
})

sock.ev.on('creds.update', saveState)

const app = express();
app.use(express.json());

interface RequestBody {
    name: string;
}

app.post('/sendMessage', async (request, response) => {
    if (request.query.token != "ufdr1xg4yk6zbnkw") {
        return response.status(401).json({
            sent: false,
            message: 'Acesso não autorizado'
        });
    }
    if (request.body.phone) {
        const id = request.body.phone
        const [result] = await sock.onWhatsApp(id)
        if (result.exists) {
            const body = request.body.body
            await sock.sendPresenceUpdate('available', result.jid)
            await sock.sendMessage(result.jid, { text: body })
            return response.json({
                sent: true
            });
        } else {
            return response.json({
                sent: false
            });
        }
    }
});

app.listen(3000, () => console.log('Listening 3000'));