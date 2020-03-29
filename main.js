const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const root = 'https://m.ko.aliexpress.com/wholesale/thankshare.html?channel=direct&keywords=thankshare';
const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));
(async () => {
    let browser;
    try {
        /*
        * It's important that the headless setting be turned off
        * in order to use the manual sign in credentials from
        * the actions described in (Step 1)
        */
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox'],
        });
        const page = await browser.newPage();
        /*
        * Ali Express's mobile page allows for infinite scrolling, this makes
        * it much easier to handle paging and crawl all the important
        * product links at the same time, that is why you need to emulate
        * a mobile device like an iPhone
        */
        await page.emulate(iPhone);
        await page.goto(root, { waitUntil: 'networkidle2', timeout: 0 });
        /*
        * Exactly how many times you need to scroll to the bottom of
        * the page is determined by how many items are caught in your
        * search, this has to be fine-tuned manually, just pick a
        * safe, large number
        */
        for (let i = 0; i < 50; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await sleep(500);
            console.log('scrolled to the bottom: ', i);
        }
        // All product detail pages have the same url structure
        const hrefs = await page.evaluate(() => {
            const anchorTags = Array.from(document.getElementsByTagName('a'));
            return anchorTags.map(x => x.href).filter(x => x.indexOf('/item/') > -1 && x.indexOf('.html') > -1);
        });
        for (let href of hrefs) {
            try {
                href = `${href.split('.html')[0]}.html`;
                await page.goto(href, { waitUntil: 'networkidle2', timeout: 0 });
                const html = await page.content();
                // each product on Ali Express has a unique id
                const itemID = href.split('/item/')[1];
                // the file name is constructed as follows:
                // {Ali Express ID}-{Unix Timestamp (in ms)}-{random number}.html
                const fileName = itemID.replace('.', `-${(new Date()).valueOf()}-${Math.floor(10000000 * Math.random())}.`);
                // save the full page html so you can parse the data whenever
                // you want
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