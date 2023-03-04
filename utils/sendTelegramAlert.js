import axios from "axios";
import * as dotenv from 'dotenv'
import { getCoinChartImage } from "./getCoinChartImg.js";

dotenv.config();

const config = {
    telegramEndPoint: `https://api.telegram.org/${ process.env.BOT_API_KEY }/sendMessage`,
    body: {
        chat_id: process.env.TELEGRAM_CHANNEL_ID,
        parse_mode: 'markdown',
        message: 'test'
    }
}

const generatePumpAlertText = async (coinData) => {
    const rockets = new Array(Math.ceil(coinData.pumpRate)).fill('🚀').join('');
    let text;

    if (coinData.pumped) {
        const pumpedChartImg = await getCoinChartImage(coinData.symbol)
        text =
        `[${coinData.symbol} pumped %${coinData.pumpRate.toFixed(2)} ${rockets} correlated coin is: ${coinData.correlatedSymbol || ''}](${pumpedChartImg})`;
    }

    if (coinData.correlated) {
        console.log(coinData.symbol)
        const correlatedCoinImg = await getCoinChartImage(coinData.symbol);

        text =
        `[${coinData.symbol} is up %${coinData.pumpRate.toFixed(2)} ${rockets}](${correlatedCoinImg})`;
    }

    return text;
}

export const sendPumpAlert = async (coinsData) => {
    try {
        const {pumped, correlated} = coinsData;

        const pumpedAlert = await axios.post(config.telegramEndPoint,
            { ...config.body, text: await generatePumpAlertText({...pumped, pumped: true, correlatedSymbol: correlated.symbol})});

        const colleratedAlert = await axios.post(config.telegramEndPoint, { ...config.body, text: await generatePumpAlertText({...correlated, correlated: true})});

        console.log({
            pumpedAlert: pumpedAlert.data,
            colleratedAlert: colleratedAlert.data

        });
        console.log('-------------------------------------------------');
    } catch (error) {
        console.log("sendPumpAlert error: " + error)
    }

    return;
}

export const sendErrorAlert = async (text) => {
    try {
        if (typeof text === 'string') {
            const { data } = await axios.post(config.telegramEndPoint, { ...config.body, text: text });
            console.log(data);
        }
    } catch (error) {
        console.log("sendErrorAlert error: " + error)
    }
}
