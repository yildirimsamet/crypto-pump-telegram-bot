import express from 'express';
import { AlertStore } from './utils/AlertStorage.js';
import { runSocket } from './utils/runSocket.js';

const app = express();
const PORT = process.env.PORT || 5000;

runSocket();

app.get('/last-alert', function (req, res) {
    return res.send(AlertStore.getLastAlertTime());
})

app.get('/sended-coins', function (req, res) {
    return res.json({ data: AlertStore.getSendedCoinsInfo() });
})

app.listen(PORT, function () {
    console.log(`Server running on http://localhost:${PORT}`);
})