import puppeteer from "puppeteer";
import { sendErrorAlert } from "./sendTelegramAlert.js";

export const getCoinChartImage = async (coinName) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
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
        const oneMinTimeButton = '#overlap-manager-root > div > span > div.menuWrap-biWYdsXC > div > div > div > div:nth-child(9) > div'
        await page.waitForSelector(oneMinTimeButton);
        await page.click(oneMinTimeButton);

        //Wait 1.5s after click 1m timeframe button
        await new Promise(r => setTimeout(r, 1500));

        //Click button which opens snapshot menu
        const snapshotButton = 'body > div.js-rootresizer__contents.layout-with-border-radius > div.layout__area--top > div > div > div:nth-child(3) > div > div > div > div > div > div:nth-child(16) > div.button-reABrhVR.apply-common-tooltip'
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