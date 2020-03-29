const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const root = 'https://m.ko.aliexpress.com/wholesale/thankshare.html?channel=direct&keywords=thankshare';
// https://m.ko.aliexpress.com/item/32689193991.html
const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));
(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, args: [
                '--no-sandbox',
            ]
        });
        const page = await browser.newPage();
        await page.emulate(iPhone);
        // await page.setViewport({ width: 350, height: 768 });
        await page.goto(root, { waitUntil: 'networkidle2', timeout: 0 });
        for (let i = 0; i < 50; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await sleep(500);
            console.log('scrolled to the bottom: ', i);
        }
        const hrefs = await page.evaluate(() => {
            const anchorTags = Array.from(document.getElementsByTagName('a'));
            return anchorTags.map(x => x.href).filter(x => x.indexOf('/item/') > -1 && x.indexOf('.html') > -1);
        });
        for (let href of hrefs) {
            try {
                href = `${href.split('.html')[0]}.html`;
                await page.goto(href, { waitUntil: 'networkidle2', timeout: 0 });
                const html = await page.content();
                const itemID = href.split('/item/')[1];
                const fileName = itemID.replace('.', `-${(new Date()).valueOf()}-${Math.floor(10000000 * Math.random())}.`);
                await fs.writeFile(path.join(__dirname, 'pages', fileName), html, (err) => {
                    if (err) console.log(err);
                });
            } catch (e) {
                console.log(e);
            } finally {
                console.log('finished scraping:', href);
            }
        }
    } catch (e) {
        console.log(e);
    } finally {
        console.log('finished crawling');
        await browser.close();
    }
})();