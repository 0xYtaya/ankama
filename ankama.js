const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const falso = require('@ngneat/falso');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const fd = require('fs');
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: 'c55524f30fc7ba50c5e773bcb8937299'
        },
        visualFeedback: true
    })
)
puppeteer.use(StealthPlugin());

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function solver(page) {
    await page.solveRecaptchas();
}

(async () => {
    //read emails.txt
    const data = fd.readFileSync('emails.txt', 'utf8').split('\n');

    const browser = await puppeteer.launch(
        {
            headless: false,
            defaultViewport: null,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        }
    );
    for (const e of data) {
        let email = e.split('|')[0];
        let password = e.split('|')[1];
        obj = {
            email: email,
            firstName: falso.randFirstName(),
            lastName: falso.randLastName(),
            password: password,
            date: falso.randBetweenDate({ from: new Date('01/01/1990'), to: new Date('01/01/2000') }),
        }
        const page = await browser.newPage();
        await page.setCacheEnabled(false);
        await page.goto('https://account.ankama.com/en/account-creation', { timeout: 0 });
        // await page.waitForNavigation();
        await page.waitForSelector('#ui-id-1 > div.ak-block-cookies-infobox > div.ak-block-btns > button.btn.btn-primary.btn-lg.ak-accept', { timeout: 100000 });
        await page.click('#ui-id-1 > div.ak-block-cookies-infobox > div.ak-block-btns > button.btn.btn-primary.btn-lg.ak-accept');
        await page.waitForSelector('#lastname');
        await page.type('#lastname', obj.lastName.toString(), { delay: 50 });
        await page.type('#firstname', obj.firstName.toString(), { delay: 50 });
        await page.type('#user_mail', obj.email.toString(), { delay: 50 });
        await page.type('#user_password', obj.password.toString(), { delay: 50 });
        await page.type('#user_password_confirm', obj.password, { delay: 50 });
        await page.select('#ak_field_1', obj.date.getFullYear().toString());
        await page.select('#ak_field_2', obj.date.getMonth().toString());
        await page.select('#ak_field_3', obj.date.getDate().toString());
        await page.waitForSelector('input[name="usernewsletter[]"]')
        await page.click('input[name="usernewsletter[]"]')
        await page.waitForSelector('#ak_field_4')
        await page.click('#ak_field_4');
        await sleep(5000);
        await solver(page);
        await page.waitForNavigation();
        console.log(obj);
        console.log('done');
        await page.close();
    }
    await browser.close();
})();