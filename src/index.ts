import express from "express";
import { parentPort, workerData, Worker } from 'worker_threads';

const app = express();
app.use(express.json());

interface RequestBody {
  name: string;
}

const workers = async () => {
    const worker = new Worker('./service.js', {
        workerData: {
          value: 15,
          path: './service.js'
        }
      });
       
      worker.on('message', (result) => {
        console.log(result);
      });
}

app.post("/instances", async (request, response) => {

})

app.put("/instances", async (request, response) => {

})

app.get("/instances", async (request, response) => {

})

app.delete("/instances", async (request, response) => {

})

app.post("/sendMessage", async (request, response) => {
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
});

app.post("/sendFile", async (request, response) => {
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
});

app.listen(3000, () => console.log("Listening 3000"));
