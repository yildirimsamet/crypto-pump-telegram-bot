import { connectSocket } from './connectSocket.js';
import { sendErrorAlert, sendPumpAlert } from './sendTelegramAlert.js';
import { AlertStore } from './AlertStorage.js'
import { correlationList } from '../enums/generalEnums.js';

class PumpConfig {
    constructor () {
        this.minimumPumpRate = '2';
        this.timeFrame = '1m';
        this.acceptedTimeFrames = ['1m', '5m', '15m', '1h'];
    }

    getMinimumPumpRate() {
        return this.minimumPumpRate;
    }

    setMinimumPumpRate(minPumpRate) {
        if (typeof parseFloat(minPumpRate) === 'number') {
            this.minimumPumpRate = minPumpRate;

            return 'Success';
        }

        return 'Please send a number';
    }

    getTimeFrame() {
        return this.timeFrame;
    }

    setTimeFrame(timeFrame) {
        if (this.acceptedTimeFrames.includes(timeFrame)) {
            this.timeFrame = timeFrame;

            return 'Success';
        }

        return 'Timeframe not allowed';
    }
}

export const pumpConfig = new PumpConfig();

export const runSocket = () => {
    connectSocket(async (data) => {
        try {
            if (data.success) {
                const tickers = data.data;
                const correlationFlatList = correlationList.flatMap((item) => item);

                console.log({
                    timeframe : pumpConfig.timeFrame,
                    minPump: pumpConfig.minimumPumpRate
                });

                const foundPumpedCoins = tickers.filter((tickerData) => {
                    const { symbol, price_change_pct } = tickerData;
        
                    return correlationFlatList.includes(symbol) && price_change_pct[pumpConfig.timeFrame] > pumpConfig.minimumPumpRate
                })
        
                for (let i = 0; i < foundPumpedCoins.length; i ++) {
                    const { symbol, price_change_pct } = foundPumpedCoins[i];
        
                    if (symbol && price_change_pct) {
                        if (AlertStore.isAlertAbleToSend(symbol)) {
                            const alertPayload = {
                                pumped: {
                                    symbol: symbol,
                                    pumpRate: price_change_pct[pumpConfig.timeFrame],
                                }
                            }
            
                            const correlatedCoin = correlationList.find(coinList => coinList.includes(symbol)).find(coinName => coinName != symbol);
                            const foundCoinPumpRateFromAllTickerData =
                                ((tickers.find(ticker => ticker.symbol === correlatedCoin) || {}).price_change_pct || [])[pumpConfig.timeFrame];
        
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