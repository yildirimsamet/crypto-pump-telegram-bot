import { connectSocket } from './connectSocket.js';
import { sendErrorAlert, sendPumpAlert } from './sendTelegramAlert.js';
import { AlertStore } from './AlertStorage.js'

const correlationList = [
    ['COSUSDT', 'COCOSUSDT'],
    ['AXSUSDT', 'SLPUSDT'],
    ['AUTOUSDT', 'BIFIUSDT'],
    ['QUICKUSDT', 'FARMUSDT'],
    ['LOKAUSDT', 'VOXELUSDT'],
    ['ASTRUSDT', 'ACAUSDT'],
    ['LAZIOUSDT', 'PORTOUSDT'],
    ['WINGUSDT', 'BONDUSDT'],
    ['DREPBUSD', 'KEYBUSD'],
    ['DFUSDT', 'CVPUSDT'],
    ['PHBBUSD', 'AMBBUSD'],
    ['HFTUSDT', 'STGUSDT'],
    ['ACMUSDT', 'ATMUSDT'],
    ['OGUSDT', 'ASRUSDT'],
    ['RAYBUSD', 'SRMBUSD'],
    ['ARUSDT', 'LPTUSDT'],
    ['SUNUSDT', 'JSTUSDT']
]

export const runSocket = () => {
    connectSocket(async (data) => {
        try {
            if (data.success) {
                const tickers = data.data;
                const correlationFlatList = correlationList.flatMap((item) => item);
                const minimumPumpRate = 0.2;
                const timeFrame = '1m';
        
                const foundPumpedCoins = tickers.filter((tickerData) => {
                    const { symbol, price_change_pct } = tickerData;
        
                    return correlationFlatList.includes(symbol) && price_change_pct[timeFrame] > minimumPumpRate
                })
        
                for (let i = 0; i < foundPumpedCoins.length; i ++) {
                    const { symbol, price_change_pct } = foundPumpedCoins[i];
        
                    if (symbol && price_change_pct) {
                        if (AlertStore.isAlertAbleToSend(symbol)) {
                            const alertPayload = {
                                pumped: {
                                    symbol: symbol,
                                    pumpRate: price_change_pct[timeFrame],
                                }
                            }
            
                            const correlatedCoin = correlationList.find(coinList => coinList.includes(symbol)).find(coinName => coinName != symbol);
                            const foundCoinPumpRateFromAllTickerData =
                                ((tickers.find(ticker => ticker.symbol === correlatedCoin) || {}).price_change_pct || [])[timeFrame];
        
                            if (correlatedCoin && foundCoinPumpRateFromAllTickerData) {
                                alertPayload.correlated = {
                                    symbol: correlatedCoin,
                                    pumpRate: foundCoinPumpRateFromAllTickerData
                                }
            
                                AlertStore.push(symbol);
                                AlertStore.push(correlatedCoin);
            
                                await sendPumpAlert(alertPayload);
                            }
                        }
                    }
                }
            } else {
                console.log(data.message);
                sendErrorAlert(data.message);
            }
        } catch (error) {
            sendErrorAlert(error.message || 'Index.js error.')
        }
    })
}