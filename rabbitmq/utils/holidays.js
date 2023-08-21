import fs from "fs";
import { parse } from "csv-parse/sync";
import moment from './moment.js'
import { __dirname } from './commons.js'
import { logger } from "./logger.js"

function loadHolidaysFromFile() {
  const fileContent = fs.readFileSync(`${__dirname}/holidays.csv`);
  const holidays = parse(fileContent, { columns: true });
  return holidays;
}

let holidays = loadHolidaysFromFile()
holidays = holidays.map((r) => {
  r['dateStr'] = r['date']
  r['date'] = moment(r['date'], 'DD-MMM-YY')
  return r
}).sort((a, b) => {
  return a['date'].diff(b['date'], 'seconds')
});

let datesOnly = holidays.map((h) => {
  return h['dateStr']
})

function isHoliday(date) {
  return datesOnly.indexOf(date.format('DD-MMM-YY')) >= 0
}

function isWeekEnd(date) {
  if (date.isoWeekday() === 6 || date.isoWeekday() === 7) {
    // it's a weekend
    logger.info(`${date} is weekend and hence skipping it considering it to be non trading day̦`)
    return true
  }
  return false
}


export { isHoliday, isWeekEnd }