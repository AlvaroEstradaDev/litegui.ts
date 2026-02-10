/**
 * @jest-environment node
 */
import puppeteer, { Browser, Page } from "puppeteer";
import path from "path";

describe('Console Interactive Verification', () =>
{
	let browser: Browser;
	let page: Page;
	const demoPath = `file://${path.resolve(__dirname, '../examples/editor.html')}`;

	beforeAll(async () =>
	{
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		page = await browser.newPage();
	});

	afterAll(async () =>
	{
		if (browser) { await browser.close(); }
	});

	beforeEach(async () =>
	{
		await page.goto(demoPath, { waitUntil: 'load' });
	});

	test('should verify Console existence and input interaction', async () =>
	{
		// 1. Wait for Console
		await page.waitForSelector('.liteconsole', { timeout: 5000 });
		const consoleEl = await page.$('.liteconsole');
		expect(consoleEl).toBeTruthy();

		// 2. Find Input
		const input = await consoleEl!.$('input');
		expect(input).toBeTruthy();

		// 3. Type Command
		const testCommand = "echo 'Hello Console'";
		await input!.click();
		await input!.type(testCommand);
		await input!.press('Enter');

		// 4. Verify Log Output (command should be echoed)
		await new Promise(r => { setTimeout(r, 100); }); // Wait for render
		const log = await consoleEl!.$('.log');
		const messages = await log?.$$('.msg');

		expect(messages?.length).toBeGreaterThan(0);

		const lastMessage = messages![messages!.length - 1];
		const text = await page.evaluate(el => el.textContent, lastMessage);
		expect(text).toContain(testCommand);
	}, 30000);

	test('should verify Console history navigation', async () =>
	{
		await page.waitForSelector('.liteconsole', { timeout: 5000 });
		const consoleEl = await page.$('.liteconsole');
		expect(consoleEl).toBeTruthy();

		const input = await consoleEl!.$('input');
		expect(input).toBeTruthy();

		// Enter command 1
		await input!.click();
		await input!.type("command1");
		await input!.press('Enter');

		// Enter command 2
		await input!.type("command2");
		await input!.press('Enter');

		await new Promise(r => { setTimeout(r, 100); });

		// Press Up Arrow -> should get command2
		await input!.press('ArrowUp');
		let value = await page.evaluate(el => el.value, input!);
		expect(value).toBe("command2");

		// Press Up Arrow again -> should get command1
		await input!.press('ArrowUp');
		value = await page.evaluate(el => el.value, input!);
		expect(value).toBe("command1");

		// Press Down Arrow -> should get command2
		await input!.press('ArrowDown');
		value = await page.evaluate(el => el.value, input!);
		expect(value).toBe("command2");

		// Press Down Arrow again -> should be empty (new line)
		await input!.press('ArrowDown');
		value = await page.evaluate(el => el.value, input!);
		expect(value).toBe("");

	}, 30000);

});
