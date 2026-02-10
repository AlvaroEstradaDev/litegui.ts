/**
 * @jest-environment node
 */
import puppeteer, { Browser, ConsoleMessage, Page } from "puppeteer";
import path from "path";

declare global
{
    interface Window
    {
        tabCallbacks: {
            tab01: boolean,
            tab02: boolean,
            buttonTab: boolean,
            plusTab: boolean
        };
    }
}

// Puppeteer integration tests for callback functionality
describe('Tabs Callback Integration Tests', () =>
{
	let browser: Browser;
	let page: Page;
	const consoleLogs: string[] = [];

	beforeAll(async () =>
	{
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
	});

	beforeEach(async () =>
	{
		consoleLogs.length = 0;
		page = await browser.newPage();

		const demoPath = 'file://' + path.resolve(__dirname, '../examples/editor.html');

		page.on('console', (msg: ConsoleMessage) =>
		{
			consoleLogs.push(msg.text());
		});

		await page.goto(demoPath, { waitUntil: 'load' });
	});

	afterEach(async () =>
	{
		if (page) {await page.close();}
	});

	afterAll(async () =>
	{
		if (browser) {await browser.close();}
	});

	test('should trigger callback when clicking on a regular tab', async () =>
	{
		// Wait for the page to fully load
		await page.waitForSelector('.litetabs', { timeout: 5000 });

		// Click tab02 first to ensure tab01 is not selected (as it is selected by default)
		const tab02 = await page.$('li[data-id="tab02"]');
		await tab02!.click();
		await new Promise(r =>
		{
			setTimeout(r, 100);
		});

		// Reset the callback flag
		await page.evaluate(() =>
		{
			window.tabCallbacks.tab01 = false;
			window.tabCallbacks.tab02 = false;
		});

		// Find and click on tab01
		const tab01 = await page.$('li[data-id="tab01"]');
		expect(tab01).toBeTruthy();
		await tab01!.click();

		// Wait a bit for the callback to execute
		await new Promise(r =>
		{
			setTimeout(r, 200);
		});

		// Verify the callback was triggered by checking the global flag
		const tab01CallbackTriggered = await page.evaluate(() =>
		{
			return window.tabCallbacks.tab01 === true;
		});

		expect(tab01CallbackTriggered).toBe(true);
	});

	test('should trigger callback when clicking on tab02', async () =>
	{
		await page.waitForSelector('.litetabs', { timeout: 5000 });

		// Reset the callback flag
		await page.evaluate(() =>
		{
			window.tabCallbacks.tab01 = false;
			window.tabCallbacks.tab02 = false;
		});

		// Find and click on tab02
		const tab02 = await page.$('li[data-id="tab02"]');
		expect(tab02).toBeTruthy();
		await tab02!.click();

		// Wait for callback
		await new Promise(r =>
		{
			setTimeout(r, 200);
		});

		// Verify callback was triggered
		const tab02CallbackTriggered = await page.evaluate(() =>
		{
			return window.tabCallbacks.tab02 === true;
		});

		expect(tab02CallbackTriggered).toBe(true);
	});

	test('should trigger callback when clicking on button tab', async () =>
	{
		await page.waitForSelector('.litetabs', { timeout: 5000 });

		// Reset the callback flag
		await page.evaluate(() =>
		{
			window.tabCallbacks.buttonTab = false;
		});

		// Find and click on button tab
		const buttonTab = await page.$('li[data-id="buttonTab"]');
		expect(buttonTab).toBeTruthy();
		await buttonTab!.click();

		// Wait for callback
		await new Promise(r =>
		{
			setTimeout(r, 200);
		});

		// Verify callback was triggered
		const buttonTabCallbackTriggered = await page.evaluate(() =>
		{
			return window.tabCallbacks.buttonTab === true;
		});

		expect(buttonTabCallbackTriggered).toBe(true);
	});

	test('should trigger callback when clicking on plus tab', async () =>
	{
		await page.waitForSelector('.litetabs', { timeout: 5000 });

		// Reset the callback flag
		await page.evaluate(() =>
		{
			window.tabCallbacks.plusTab = false;
		});

		// Find and click on plus tab
		const plusTab = await page.$('li[data-id="plus_tab"]');
		expect(plusTab).toBeTruthy();
		await plusTab!.click();

		// Wait for callback
		await new Promise(r =>
		{
			setTimeout(r, 200);
		});

		// Verify callback was triggered
		const plusTabCallbackTriggered = await page.evaluate(() =>
		{
			return window.tabCallbacks.plusTab === true;
		});

		expect(plusTabCallbackTriggered).toBe(true);
	});

	test('should trigger main tabs callback when switching tabs', async () =>
	{
		await page.waitForSelector('.litetabs', { timeout: 5000 });

		// Reset callback flags
		await page.evaluate(() =>
		{
			window.tabCallbacks.tab01 = false;
			window.tabCallbacks.tab02 = false;
		});

		// Click Code tab (assuming it is the first LI)
		const firstTab = await page.$('.litetabs li:first-child');
		await firstTab!.click();
		await new Promise(r =>
		{
			setTimeout(r, 100);
		});

		// Click on tab02 to switch to it
		const tab02 = await page.$('li[data-id="tab02"]');
		await tab02!.click();
		await new Promise(r =>
		{
			setTimeout(r, 200);
		});

		// Verify main callback was triggered
		const mainCallbackLogFound = consoleLogs.some(log => log.includes("Main callback triggered: tab02"));
		expect(mainCallbackLogFound).toBe(true);
	});

	test('should show correct tab content when clicking on tab', async () =>
	{
		await page.waitForSelector('.litetabs', { timeout: 5000 });

		// Explicitly click tab01 first to ensure it is selected
		const tab01 = await page.$('li[data-id="tab01"]');
		await tab01!.click();
		await new Promise(r =>
		{
			setTimeout(r, 200);
		});

		// Now tab01 should be selected
		const tab01Selected = await page.$eval('li[data-id="tab01"]', (el) => el.classList.contains('selected'));
		expect(tab01Selected).toBe(true);

		// Click on tab02
		const tab02 = await page.$('li[data-id="tab02"]');
		await tab02!.click();
		await new Promise(r =>
		{
			setTimeout(r, 200);
		});

		// Now tab02 should be selected
		const tab02Selected = await page.$eval('li[data-id="tab02"]', (el) => el.classList.contains('selected'));
		expect(tab02Selected).toBe(true);

		// Tab01 should not be selected
		const tab01NotSelected = await page.$eval('li[data-id="tab01"]', (el) => !el.classList.contains('selected'));
		expect(tab01NotSelected).toBe(true);
	});
});
