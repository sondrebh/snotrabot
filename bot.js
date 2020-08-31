/* <Dependencies> */
const { CoinbasePro } = require('coinbase-pro-node');
const moment = require('moment');
/* </Dependencies> */

/* <Initials> */
const auth = {
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    useSandbox: true,
};

const client = new CoinbasePro(auth);
/* </Initials> */

/* <Global Vars> */

const use_stop_loss = false;
const stop_percentage = 1.5; // % 
const margin_offset = 50; // %

let balance = 10000; // $
let amount = 0;
let inTrade = false;

/* </Global Vars> */

const main = async () => {
    console.clear();
    console.log("--------------------");
    console.log("Balance: " + balance);
    console.log("Amount: " + amount);
    console.log(" ");

    const lastData = await client.rest.product.getProductStats("BTC-USD");

    const { high, low, last } = lastData;

    if(last > low) {
        const diffP = (high - low) / low * 100;
        const marginP = diffP * (margin_offset / 10000);
        const sellPrice = high - (high * marginP);
        const buyPrice = low * (1 + marginP);
        
        if(!inTrade) {
            if(last <= buyPrice) {
                amount = balance / last;
                console.log("Bought " + amount + " BTC for " + balance);
                balance = 0;
                inTrade = true;
            }
        } else {
            if(last >= sellPrice) {
                balance = amount * last;
                console.log("Sold " + amount + " BTC for " + balance);
                amount = 0;
                inTrade = false;
            }
        }
    }

    console.log(" ");
    console.log("Last: " + last + "$");
    console.log(" ");
    console.log("Unrealised balance: " + amount * last + "$");
    console.log(" ");

    setTimeout(main, 60000);
}

main();