import express from 'express';
import { AlertStore } from './utils/AlertStorage.js';
import { pumpConfig, runSocket } from './utils/runSocket.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

runSocket();

app.get('/last-alert', (req, res) => {
    return res.send(AlertStore.getLastAlertTime());
})

app.get('/sended-coins', (req, res) => {
    return res.json({ data: AlertStore.getSendedCoinsInfo() });
})

app.post('/timeframe', (req, res) => {
    const timeframe = req.body.timeframe;
    if (timeframe) {
        return res.send(pumpConfig.setTimeFrame(timeframe))
    }
    return res.send('timeframe parameter needed.')
})

app.post('/pumprate', (req, res) => {
    const pumprate = req.body.pumprate;

    if (!isNaN(pumprate) && !isNaN(parseFloat(pumprate))) {
        return res.send(pumpConfig.setMinimumPumpRate(pumprate))
    }
    return res.send('pumprate parameter needed.')
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})