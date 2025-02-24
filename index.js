const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("https://news.ycombinator.com/newest", {
      waitUntil: "domcontentloaded",
    });

    const timestamps = [];

    for (let i = 0; i < 4; i++) {
      const pageTimestamps = await page.$$eval(".age", (elements) =>
        elements.map((el) => el.getAttribute("title"))
      );

      timestamps.push(...pageTimestamps);

      if (i < 3) {
        // Just await the click - it resolves after navigation
        await page.click("a.morelink", { timeout: 30000 });
      }
    }

    const first100Timestamps = timestamps.slice(0, 100);

    if (first100Timestamps.length !== 100) {
      console.log(
        `Error: Found ${first100Timestamps.length} articles instead of 100`
      );
      return;
    }

    let isSorted = true;
    for (let i = 1; i < first100Timestamps.length; i++) {
      const prevDate = new Date(first100Timestamps[i - 1]);
      const currDate = new Date(first100Timestamps[i]);

      if (prevDate < currDate) {
        isSorted = false;
        console.log(`Sorting error at position ${i}:`);
        console.log(`Previous: ${first100Timestamps[i - 1]} (${prevDate})`);
        console.log(`Current: ${first100Timestamps[i]} (${currDate})`);
        break;
      }
    }

    console.log(`Validated ${first100Timestamps.length} articles`);
    console.log(`Articles are sorted from newest to oldest: ${isSorted}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    //await browser.close();
  }
}

(async () => {
  await sortHackerNewsArticles();
})();
