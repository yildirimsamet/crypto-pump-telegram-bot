import puppeteer from "puppeteer";
import { pumpConfig } from "./runSocket.js";
import { sendErrorAlert } from "./sendTelegramAlert.js";


export const getCoinChartImage = async (coinName) => {
    try {
        const selectedTimeframeButton = {
            '1m': '[data-name="menu-inner"] [data-value="1"]',
            '5m': '[data-name="menu-inner"] [data-value="5"]',
            '15m': '[data-name="menu-inner"] [data-value="15"]',
            '1h': '[data-name="menu-inner"] [data-value="60"]',
        }[pumpConfig.timeFrame]
        
        const browser = await puppeteer.launch({
            headless: false,
            'clipboard-read': true,
            defaultViewport: null,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        await browser.defaultBrowserContext()
            .overridePermissions('https://www.tradingview.com', ['clipboard-read', 'clipboard-write']);

        const page = await browser.newPage();
        const pageTarget = page.target();

        await page.goto('https://www.tradingview.com/chart/?symbol=BINANCE:' + coinName);

        await page.setViewport({ width: 1500, height: 1024 });

        //Timeframe button which opens timeframes section
        const timeIntervalMainButton = '#header-toolbar-intervals'
        await page.waitForSelector(timeIntervalMainButton);
        await page.click(timeIntervalMainButton);

        //Click 1m timeframe button
        await page.waitForSelector(selectedTimeframeButton);
        await page.click(selectedTimeframeButton);

        //Wait 1.5s after click selected timeframe button
        await new Promise(r => setTimeout(r, 1500));

        //Click button which opens snapshot menu
        const snapshotButton = '#header-toolbar-screenshot'
        await page.waitForSelector(snapshotButton);
        await page.click(snapshotButton);

        //Click open image in new tab
        const takeSnaphotButton = '[data-name="open-image-in-new-tab"]'
        await page.waitForSelector(takeSnaphotButton);
        await page.click(takeSnaphotButton);


        const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
        const newPage = await newTarget.page();

        await newPage.waitForSelector('.tv-snapshot-image');

        const chartUrl = newPage.url();

        await browser.close();

        return chartUrl;
    } catch (error) {
        sendErrorAlert(error.message);

        return null;
    }
}