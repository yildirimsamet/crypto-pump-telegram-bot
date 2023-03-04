import express from 'express';
import { AlertStore } from './utils/AlertStorage.js';
import { runSocket } from './utils/runSocket.js';

const app = express();
const PORT = process.env.PORT || 5000;

runSocket();

// app.get('/run', async function (req, res) {
//     try {
//         runSocket();

//         return res.send('Socket ran.');
//     } catch (error) {
//         return res.send(error.message || 'Socket couldnt run')
//     }
// })

app.get('/last-alert', function (req, res) {
    return res.send(AlertStore.getLastAlertTime());
})

app.get('/sended-coins', function (req, res) {
    return res.json({ data: AlertStore.getSendedCoinsInfo() });
})

app.listen(5000, function () {
    console.log(`Server running on http://localhost:${PORT}`);
})