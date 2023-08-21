import fs from "fs";
import { parse } from "csv-parse/sync";
import moment from './moment.js'
import { __dirname } from './commons.js'

function loadExpiriesFromFile() {
  const fileContent = fs.readFileSync(`${__dirname}/expiries.csv`);
  const expiries = parse(fileContent, { columns: true });
  return expiries;
}

let expiries = loadExpiriesFromFile()
expiries = expiries.map((r) => {
  r['expiryDate'] = moment(r['expiryDate'], 'DD-MM-YYYY')
  r['month'] = r['expiryDate'].format('MM')
  return r
}).sort((a, b) => {
  return a['expiryDate'].diff(b['expiryDate'], 'seconds')
});

(() => {
  // data enrichment
  const daysBack = 3
  expiries.forEach((expiry, index) => {
    if (index > 0) {
      expiry['prevWeekExpiryDate'] = expiries[index - 1]['expiryDate']
    } else {
      // first element guessing last expiry date
      expiry['prevWeekExpiryDate'] = expiries[0]['expiryDate'].clone().subtract(10, 'd')
    }
    if (expiry['type'] === 'M') {
      // add last month's expiry date
      let firstExpiryOfMonth = expiries.filter((e) => e['month'] === expiry['month'])[0]
      expiry['prevMonthExpiryDate'] = firstExpiryOfMonth['prevWeekExpiryDate']
    }

    if (expiry['prevMonthExpiryDate']) {
      expiry['dataLookupStartDate'] = expiry['prevMonthExpiryDate'].clone().subtract(daysBack, 'd');
    } else if (expiry['prevWeekExpiryDate']) {
      expiry['dataLookupStartDate'] = expiry['prevWeekExpiryDate'].clone().subtract(daysBack, 'd');
    } else {
      // it has neither Weekly not monthly previous expiry date, it's the first element go back to 10 days
      expiry['dataLookupStartDate'] = expiry['expiryDate'].clone().subtract(10, 'd');
    }
    expiry['startDate']
  })
})();

export { expiries }