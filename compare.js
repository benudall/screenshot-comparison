const puppeteer = require("puppeteer");
const fs = require("fs");
const BlinkDiff = require("blink-diff");
const opn = require("opn");
const args = process.argv.slice(2);

let url1 = args[0];
let url2 = args[1];
if(!url1 || !url2){
	console.log("URL missing from input");
	return;
}
if(url1.slice(0,4) != "http"){
	url1 = "http://" + url1;
}
if(url2.slice(0,4) != "http"){
	url2 = "http://" + url2;
}
function urlToFileUrl(url){
	return url.replace(/https?:\/\//,"").replace(/\/$/,"").replace(/(:\/\/|\.|\s|\/)/g,"_") + ".png";
}
let fileUrl1 = urlToFileUrl(url1);
let fileUrl2 = urlToFileUrl(url2);

async function getScreenshot(url,fileUrl){
	const browser = await puppeteer.launch({ignoreHTTPSErrors:true});
	const page = await browser.newPage();
	page.setViewport({width:1920,height:1080})
	await page.goto(url1);
	await page.screenshot({path:fileUrl,fullPage: true});
	await browser.close();
}

(async () => {
	await getScreenshot(url1,fileUrl1);
	console.log(fileUrl1);
	await getScreenshot(url2,fileUrl2);
	console.log(fileUrl2);
	
	console.log("Setting");
	let diff = new BlinkDiff({
		imageAPath: fileUrl1,
		imageBPath: fileUrl2,
		thresholdType: BlinkDiff.THRESHOLD_PERCENT,
		threshold: 0,
		imageOutputPath: "diff.png",
		composeLeftToRight: true
	});
	
	console.log("Starting");
	
	diff.run(function (error, result) {
		// if (error) {
			// throw error;
		// } else {
			// let percent = Math.round(100 * result.differences/result.dimension) + '% different';
			// if(diff.hasPassed(result.code)){
				// console.log('\x1b[32mPASSED\x1b[0m ' + percent);
			// } else{
				// console.log('\x1b[31mFAILED\x1b[0m ' + percent);
			// }
			// opn("diff.png");
		// }
	});
})();