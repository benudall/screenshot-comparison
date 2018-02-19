const puppeteer = require("puppeteer");
const fs = require("fs");
const BlinkDiff = require("blink-diff");
const opn = require("opn");
const args = process.argv.slice(2);

let rawUrl = args[0];
if(rawUrl.slice(0,4) != "http"){
	url = "http://" + rawUrl;
} else{
	url = rawUrl;
}
let d = new Date();
let dateString = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+"-"+d.getHours()+"-"+d.getMinutes()+" ";
let fileUrl = url.replace(/(:\/\/|\.|\s|\/)/g,"_");
let fileName = dateString + fileUrl + ".png";
let filePath = "output/" + fileName;
let baseline = "baseline/" + fileUrl + ".png";

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	page.setViewport({width:1920,height:1080})
	await page.goto(url);
	if(!fs.existsSync(baseline)){
		console.log("No baseline found, now creating " + baseline);
		await page.screenshot({path: baseline, fullPage: true});
		await browser.close();
		return;
	}
	await page.screenshot({path: filePath,fullPage: true});
	await browser.close();
	
	let diff = new BlinkDiff({
		imageAPath: filePath,
		imageBPath: baseline,
		thresholdType: BlinkDiff.THRESHOLD_PERCENT,
		threshold: 0,
		imageOutputPath: filePath,
		composeLeftToRight: true
	});
	
	diff.run(function (error, result) {
		if (error) {
			throw error;
		} else {
			let percent = Math.round(100 * result.differences/result.dimension) + '% different';
			if(diff.hasPassed(result.code)){
				console.log('\x1b[32mPASSED\x1b[0m ' + percent);
			} else{
				console.log('\x1b[31mFAILED\x1b[0m ' + percent);
			}
			opn(filePath);
		}
	});
})();