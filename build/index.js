"use strict";
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
const worker_threads_1 = require("worker_threads");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const workers = () => __awaiter(void 0, void 0, void 0, function* () {
    const worker = new worker_threads_1.Worker('./service.js', {
        workerData: {
            value: 15,
            path: './service.js'
        }
    });
    worker.on('message', (result) => {
        console.log(result);
    });
});
app.post("/instances", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
}));
app.put("/instances", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
}));
app.get("/instances", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
}));
app.delete("/instances", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
}));
app.post("/sendMessage", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.query.token != "ufdr1xg4yk6zbnkw") {
        return response.status(401).json({
            sent: false,
            message: "Acesso não autorizado",
        });
    }
    if (request.body.phone) {
        const id = request.body.phone;
        /*const [result] = await sock.onWhatsApp(id);
        if (result.exists) {
          const body = request.body.body;
          await sock.sendPresenceUpdate("available", result.jid);
          await sock.sendMessage(result.jid, { text: body });
    
          return response.json({
            sent: true,
          });
        } else {*/
        return response.json({
            sent: false,
        });
        //}
    }
}));
app.post("/sendFile", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.query.token != "ufdr1xg4yk6zbnkw") {
        return response.status(401).json({
            sent: false,
            message: "Acesso não autorizado",
        });
    }
    if (request.body.phone) {
        const id = request.body.phone;
        /* const [result] = await sock.onWhatsApp(id)
                if (result.exists) {
                    await sock.sendPresenceUpdate('available', result.jid)
                    await sock.sendMessage(result.jid, { document: { url: request.body.url }, mimetype: request.body.mimetype, fileName: request.body.fileName })
                    return response.json({
                        sent: true
                    });
                } else {*/
        return response.json({
            sent: false,
        });
        // }
    }
}));
app.listen(3000, () => console.log("Listening 3000"));
