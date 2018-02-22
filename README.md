# screenshot-comparison
Screenshot comparison using node, puppeteer and blink-diff
# Regression Usage
Run with 
```<language>
$ node regression [URL]
```
If there's no baseline file it will create it in a baseline folder
If there is a baseline it will create a comparison image in the output folder

#Create Custom Test Suites
```<language>
const regression = require("./regression-export");

(async () => {
	await regression.init();
	await regression.test("http://example.com");
  await regression.test("http://example.com");
	await regression.end();
})();
```
# Compare Usage
```<language>
$ node regression [URL1] [URL2]
```
Will save images for both URLs and create diff.png to show the difference
