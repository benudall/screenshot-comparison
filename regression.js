const regression = require("./regression-export");
const args = process.argv.slice(2);

let rawUrl = args[0];

(async () => {
	await regression.init();
	await regression.test(rawUrl);
	await regression.end();
})();