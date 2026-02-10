/**
 * @jest-environment node
 */
import puppeteer, { Browser, Page } from "puppeteer";
import path from "path";

describe('Table Interactive Verification', () =>
{
	let browser: Browser;
	let page: Page;
	const demoPath = `file://${path.resolve(__dirname, '../examples/editor.html')}`;
	const consoleLogs: string[] = [];

	beforeAll(async () =>
	{
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		page = await browser.newPage();

		page.on('console', msg =>
		{
			consoleLogs.push(msg.text());
		});

		page.on('pageerror', (err: Error | unknown) =>
		{
			if (typeof err === "object" && err !== null && "message" in err)
			{
				console.error('Page Error:', err.message);
				consoleLogs.push('Page Error: ' + err.message);
			}
		});
	});

	afterAll(async () =>
	{
		if (browser) {await browser.close();}
	});

	beforeEach(async () =>
	{
		consoleLogs.length = 0;
		await page.goto(demoPath, { waitUntil: 'load' });
	});

	test('should open table dialog and display data', async () =>
	{
		// Wait for the button to be available
		await page.waitForSelector('button.litebutton', { visible: true });

		// Find the widget containing "Table Dialog"
		const widgets = await page.$$('.inspector .widget');
		let tableWidget = null;
		for (const widget of widgets)
		{
			const text = await page.evaluate(el => el.textContent, widget);
			if (text && text.includes("Table Dialog"))
			{
				tableWidget = widget;
				break;
			}
		}


		expect(tableWidget).toBeTruthy();

		// Find button inside this widget
		const tableButton = await tableWidget!.$('button');
		expect(tableButton).toBeTruthy();

		// Click it
		await tableButton!.click();

		// Wait for dialog
		await page.waitForSelector('#table-dialog', { visible: true });

		// Check for table inside dialog
		const table = await page.$('#table-dialog table.litetable');
		expect(table).toBeTruthy();

		// Verify content
		const content = await page.evaluate(() =>
		{
			const dialog = document.querySelector('#table-dialog');
			return dialog ? dialog.innerHTML : "";
		});

		expect(content).toContain("John");
		expect(content).toContain("Developer");
		expect(content).toContain("Manager");
		expect(content).toContain("40");

	}, 60000);
});
