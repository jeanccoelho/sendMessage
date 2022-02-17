"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const { state, saveState } = (0, baileys_1.useSingleFileAuthState)('./DRXSports.json');
const sock = (0, baileys_1.default)({
    auth: state,
    printQRInTerminal: true,
    version: [2, 2204, 13],
});
sock.ev.on('connection.update', (update) => {
    var _a, _b;
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        const shouldReconnect = ((_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== baileys_1.DisconnectReason.loggedOut;
        console.log('connection closed due to ', lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error, ', reconnecting ', shouldReconnect);
        // reconnect if not logged out
        // if (shouldReconnect) {
        //     connectToWhatsApp()
        // }
    }
    else if (connection === 'open') {
        console.log('opened connection');
    }
});
sock.ev.on('messages.upsert', (m) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = m.messages[0];
    if (!msg.key.fromMe && m.type === 'notify') {
        console.log('replying to', msg.key.remoteJid);
        yield sock.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id]);
        yield sock.sendMessage(msg.key.remoteJid, { text: "Desculpe esse telefone não é monitorado, por favor procure o suporte!\n" + Date() });
    }
    // console.log(JSON.stringify(m, undefined, 2))
    // console.log('replying to', m.messages[0].key.remoteJid)
    //await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Desculpe esse telefone não é monitorado, por favor procure o suporte!' })
}));
sock.ev.on('creds.update', saveState);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/sendMessage', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.query.token != "ufdr1xg4yk6zbnkw") {
        return response.status(401).json({
            sent: false,
            message: 'Acesso não autorizado'
        });
    }
    if (request.body.phone) {
        const id = request.body.phone;
        const [result] = yield sock.onWhatsApp(id);
        if (result.exists) {
            const body = request.body.body;
            const sent = yield sock.sendMessage(result.jid, { text: body });
            yield sock.sendMessage(result.jid, { delete: sent.key });
            return response.json({
                sent: true
            });
        }
        else {
            return response.json({
                sent: false
            });
        }
    }
}));
app.listen(3000, () => console.log('Listening 3000'));
