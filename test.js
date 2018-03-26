const fs = require("fs");
const parse = require("csv-parse/lib/sync");
const { DateTime } = require("luxon");

const list = fs.readFileSync("list.csv", "utf8");
const listParsed = parse(list);
listParsed.shift(); // header row

const now = DateTime.local();

let previous = "";
let seen = [];
listParsed.forEach(row => {
  const [username, expiry] = row;
  if (seen.includes(username)) {
    console.error(`Duplicate username: ${username}`);
    process.exit(1);
  }
  seen.push(username);
  if (username < previous) {
    console.error(`List is not in alphabetical order: ${username}`);
    process.exit(1);
  }
  previous = username;
  const expiryDate = DateTime.fromISO(expiry);
  if (!expiryDate.isValid) {
    console.error(`Cannot parse expiry: ${expiry}`);
    process.exit(1);
  }
  if (expiryDate > now.plus({ months: 12, weeks: 1 })) {
    console.error(
      `${username} expiry "${expiry}" cannot be more than 1 year in advance`
    );
    process.exit(1);
  }
});
