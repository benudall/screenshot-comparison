const puppeteer = require("puppeteer");
const fs = require("fs");
const BlinkDiff = require("blink-diff");
const opn = require("opn");
const args = process.argv.slice(2);

module.exports = {
	init : async function () {
		//console.log("Starting browser");
		browser = await puppeteer.launch({ignoreHTTPSErrors:true});
	},
	end : async function () {
		//console.log("Closing browser");
		await browser.close();
	},
	test : async function (_url,_open) {
		try{
			if(!_url){
				console.log("No URL provided");
				return;
			}
			let url = "";
			if(_url.slice(0,4) != "http"){
				url = "http://" + _url;
			} else{
				url = _url;
			}
			let d = new Date();
			let dateString = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+"-"+d.getHours()+"-"+d.getMinutes()+" ";
			let fileUrl = url.replace(/\/$/,"").replace(/(:\/\/|\.|\s|\?|\/)/g,"_");
			let fileName = dateString + fileUrl + ".png";
			let filePath = "output/" + fileName;
			let baseline = "baseline/" + fileUrl + ".png";
			
			//console.log("Launching page " + url);
			const page = await browser.newPage();
			page.setViewport({width:1920,height:1080})
			await page.goto(url);
			if(!fs.existsSync(baseline)){
				console.log("\x1b[93mSKIPPED\x1b[0m No baseline found, now creating " + baseline);
				await page.screenshot({path: baseline, fullPage: true});
				return;
			}
			//console.log("Screenshotting " + url);
			await page.screenshot({path: filePath,fullPage: true});
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
					console.log("Diff run error");
					console.log(error);
					throw error;
				} else {
					let percent = Math.round(10000 * result.differences/result.dimension)/100 + "% different " + url;
					if(diff.hasPassed(result.code)){
						console.log("\x1b[32mPASSED\x1b[0m " + percent);
					} else{
						console.log("\x1b[31mFAILED\x1b[0m " + percent);
					}
					if(_open === "open") opn(filePath);
					return;
				}
			});
		}
		catch(error){
			console.log("Test error");
			console.log(error);
			console.log(end);
		}
	}
}