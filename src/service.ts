import { parentPort, workerData } from "worker_threads";
import { Boom } from "@hapi/boom";
import makeWASocket, {
  AnyMessageContent,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  MessageRetryMap,
  useMultiFileAuthState,
} from "@adiwajshing/baileys";

const sendMessage = async (type : String, message: String) => {
  parentPort?.postMessage({
    instance: workerData.instance.name,
    body: {
      type,
      message,
      createdAt: new Date().getTime()
    },
  });
};

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(
    workerData.instance.name
  );
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
  });

  const sendMessageWTyping = async (msg: AnyMessageContent, jid: string) => {
    await sock.presenceSubscribe(jid);
    await delay(500);

    await sock.sendPresenceUpdate("composing", jid);
    await delay(2000);

    await sock.sendPresenceUpdate("paused", jid);

    await sock.sendMessage(jid, msg);
  };

  sock.ev.on("call", (item) => console.log("recv call event", item));
  sock.ev.on("chats.set", (item) =>
    console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`)
  );
  sock.ev.on("messages.set", (item) =>
    console.log(
      `recv ${item.messages.length} messages (is latest: ${item.isLatest})`
    )
  );
  sock.ev.on("contacts.set", (item) =>
    console.log(`recv ${item.contacts.length} contacts`)
  );

  sock.ev.on("messages.upsert", async (m) => {
    console.log(JSON.stringify(m, undefined, 2));

    const msg = m.messages[0];
    /*if(!msg.key.fromMe && m.type === 'notify' && doReplies) {
			console.log('replying to', m.messages[0].key.remoteJid)
			await sock!.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
			await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)
		}*/
  });

  sock.ev.on("messages.update", (m) => console.log(m));
  sock.ev.on("message-receipt.update", (m) => console.log(m));
  sock.ev.on("messages.reaction", (m) => console.log(m));
  sock.ev.on("presence.update", (m) => console.log(m));
  sock.ev.on("chats.update", (m) => console.log(m));
  sock.ev.on("chats.delete", (m) => console.log(m));
  sock.ev.on("contacts.upsert", (m) => console.log(m));

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        sendMessage('connection','reconnect')
      } else {
        sendMessage('connection','disconnected')
      }
    }
    console.log("connection update", update);
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
};

startSock();
