const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const falso = require('@ngneat/falso');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const fd = require('fs');

var accountsNumber = 5; // Number of accounts to create

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

async function popup(page) {
    if (flag == false)
    {
        try {
            await page.waitForSelector('#ui-id-1 > div.ak-block-cookies-infobox > div.ak-block-btns > button.btn.btn-primary.btn-lg.ak-accept', { timeout: 10000000 });
            await page.click('#ui-id-1 > div.ak-block-cookies-infobox > div.ak-block-btns > button.btn.btn-primary.btn-lg.ak-accept');
        } catch { }
        flag = true;
    }
}

var flag = false;

(async () => {
    // const data = fd.readFileSync('emails.txt', 'utf8').split('\n'); // not used anymore
    const browser = await puppeteer.launch(
        {
            headless: false,
            defaultViewport: null,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: [
                `--disable-features=site-per-process`,
                `--window-size=1920,1080`,
                `--ignore-certificate-errors`,
            ]
        }
    );
    
    console.log(`[*] Navigateur internet`)
    for (let i  = 0 ; i < accountsNumber ; i++) {
        let email = undefined;
        let password = undefined;
        obj = {
            email: email, // here the email is undefined you need to get it from the api
            firstName: falso.randFirstName(),
            lastName: falso.randLastName(),
            password: password, // here the password is undefined you need to get it from the api
            date: falso.randBetweenDate({ from: new Date('01/01/2000'), to: new Date('01/01/2004') }),
        }
        let page = await browser.newPage();
        await page.goto('https://account.ankama.com/fr/creer-un-compte', { timeout: 0 , waitUntil: 'networkidle2'});
        await popup(page);
        console.log("account creation :");
        await page.waitForSelector('#lastname');
        await page.type('#lastname', obj.lastName.toString(), { delay: 50 });
        await page.type('#firstname', obj.firstName.toString(), { delay: 50 }); // will break if the api return undefined
        await page.type('#user_mail', obj.email.toString(), { delay: 50 });
        await page.type('#user_password', obj.password.toString(), { delay: 50 }); // will break if the api return undefined
        await page.type('#user_password_confirm', obj.password, { delay: 50 }); // will break if the api return undefined
        await page.waitForSelector('select[name="birth_day"]');
        await page.select('select[name="birth_day"]', obj.date.getDate().toString());
        await sleep(1000);
        await page.select('select[name="birth_month"]', obj.date.getMonth().toString());
        await sleep(1000);
        await page.select('select[name="birth_year"]', obj.date.getFullYear().toString());
        await sleep(1000);
        await page.waitForSelector('input[name="usernewsletter[]"]')
        await page.click('input[name="usernewsletter[]"]')
        await page.waitForSelector('#ak_field_4')
        await page.click('#ak_field_4');
        await sleep(5000);
        await solver(page);
        await page.waitForNavigation();
        console.log(`account created: ${obj.email} | ${obj.password}`);
        await page.close();
    }
    await browser.close();
})();