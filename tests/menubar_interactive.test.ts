/**
 * @jest-environment node
 */
import puppeteer, { Browser, Page } from "puppeteer";
import path from "path";

describe('Menubar Interactive Verification', () =>
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
			if (err && typeof err === "object" && "message" in err)
			{
				console.error('Page Error:', err.message);
				consoleLogs.push('Page Error: ' + err.message);
			}
			else
			{
				console.error('Page Error:', err);
				consoleLogs.push('Page Error: ' + err);
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

	test('should verify File menu interaction', async () =>
	{
		// Find "File" menu item
		await page.waitForSelector('.litemenubar', { visible: true });

		const menuItems = await page.$$('.litemenubar li');
		let fileMenu = null;
		for (const item of menuItems)
		{
			const text = await page.evaluate(el => el.textContent, item);
			if (text && text.includes("File"))
			{
				fileMenu = item;
				break;
			}
		}
		expect(fileMenu).toBeTruthy();

		// Click "File"
		await fileMenu!.click();

		// Wait for dropdown panel
		await page.waitForSelector('.litemenubar-panel', { visible: true });

		// Find "New" option
		const entries = await page.$$('.litemenubar-panel .litemenu-entry');
		let newEntry = null;
		for (const entry of entries)
		{
			const text = await page.evaluate(el => el.textContent, entry);
			if (text && text.includes("New"))
			{
				newEntry = entry;
				break;
			}
		}
		expect(newEntry).toBeTruthy();

		// Click "New"
		await newEntry!.click();

		// Verify Log
		await new Promise(resolve =>
		{
			setTimeout(resolve, 100);
		}); // Wait for console log
		expect(consoleLogs.some(l => l.includes("File New clicked"))).toBe(true);
	}, 60000);

	test('should verify View Panel checkbox interaction', async () =>
	{
		// Find "View" menu item
		await page.waitForSelector('.litemenubar', { visible: true });

		const menuItems = await page.$$('.litemenubar li');
		let viewMenu = null;
		for (const item of menuItems)
		{
			const text = await page.evaluate(el => el.textContent, item);
			if (text && text.includes("View"))
			{
				viewMenu = item;
				break;
			}
		}
		expect(viewMenu).toBeTruthy();

		// Click "View"
		await viewMenu!.click();

		// Wait for dropdown
		await page.waitForSelector('.litemenubar-panel', { visible: true });

		// Find "Controls" option
		const entries = await page.$$('.litemenubar-panel .litemenu-entry');
		let controlsEntry = null;
		for (const entry of entries)
		{
			const text = await page.evaluate(el => el.textContent, entry);
			if (text && text.includes("Controls"))
			{
				controlsEntry = entry;
				break;
			}
		}
		expect(controlsEntry).toBeTruthy();

		// Hover "Controls" to open (testing autoOpen)
		await controlsEntry!.hover();

		// Find "Panel" option
		const entries2 = await page.$$('.litemenubar-panel .litemenu-entry');
		let panelEntry = null;
		for (const entry of entries2)
		{
			const text = await page.evaluate(el => el.textContent, entry);
			if (text && text.includes("Panel"))
			{
				panelEntry = entry;
				break;
			}
		}
		expect(panelEntry).toBeTruthy();

		// Click "Panel" to toggle
		await panelEntry!.click();

		// Verify Log for Toggle
		await new Promise(resolve =>
		{
			setTimeout(resolve, 100);
		});
		expect(consoleLogs.some(l => l.includes("View Panel toggled"))).toBe(true);
		expect(consoleLogs.some(l => l.includes("false"))).toBe(true);

	}, 60000);

});
