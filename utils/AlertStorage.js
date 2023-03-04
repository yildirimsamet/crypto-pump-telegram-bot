class AlertStorage {
    constructor() {
        this.sendedCoinsInfo = [];
        this.lastAlertTime = [];
    }

    #removeExpiredDatas() {
        this.sendedCoinsInfo = this.sendedCoinsInfo.filter(({ expires }) => (expires > new Date().getTime()))
    }

    push(coinName) {
        this.#removeExpiredDatas();

        var isCoinAlertAlreadySend = this.sendedCoinsInfo.some((alreadySendedCoin) => alreadySendedCoin.name === coinName)

        if (!isCoinAlertAlreadySend) {
            const currentTime = new Date().getTime();

            this.sendedCoinsInfo.push({ name: coinName, expires: currentTime + (1000 * 60 * 60) })

            this.lastAlertTime.push(currentTime);
        }
    }

    isAlertAbleToSend(coinName) {
        this.#removeExpiredDatas();

        return !this.sendedCoinsInfo.some((alreadySendedCoin) => alreadySendedCoin.name === coinName);
    }

    getLastAlertTime() {
        console.log(this.lastAlertTime);
        return new Date(this.lastAlertTime.slice(-1)[0]);
    }

    getSendedCoinsInfo() {
        console.log(this.sendedCoinsInfo);
        return this.sendedCoinsInfo
    }

}

export const AlertStore = new AlertStorage();