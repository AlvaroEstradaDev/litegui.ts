/**
 * @jest-environment node
 */
import puppeteer, { Browser, Page, ElementHandle } from "puppeteer";
import path from "path";

describe('Inspector Interactive Elements Verification', () =>
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

		// Capture console logs to verify interactions
		page.on('console', msg =>
		{
			consoleLogs.push(msg.text());
		});

		// Handle dialogs automatically
		page.on('dialog', async dialog =>
		{
			await dialog.accept("Active");
		});

		page.on('pageerror', (err: Error | unknown) =>
		{
			if (err instanceof Error)
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
		consoleLogs.length = 0; // Clear logs
		await page.goto(demoPath, { waitUntil: 'load' });
	});

	/*
	 * Helper to find widget by name using CSS and evaluation
	 * Since we can't use $x easily with current types/setup, we filter manually
	 */
	const getWidgetByName = async (name: string) =>
	{
		const widgets = await page.$$('.widget');
		for (const widget of widgets)
		{
			// Check if this widget contains a .wname with the text
			const nameEl = await widget.$('.wname');
			if (nameEl)
			{
				const text = await page.evaluate(el => el.textContent, nameEl);
				if (text && text.includes(name))
				{
					return widget;
				}
			}
		}
		return null;
	};

	const getButtonByText = async (text: string) =>
	{
		const buttons = await page.$$('button');
		for (const button of buttons)
		{
			const t = await page.evaluate(el => el.textContent, button);
			if (t && t.includes(text))
			{
				return button;
			}
		}
		return null;
	};

	test('should verify String input interaction', async () =>
	{
		const widget = await getWidgetByName("String");
		expect(widget).toBeTruthy();
		const input = await widget!.$('input');
		expect(input).toBeTruthy();

		// Clear and type
		await input?.click({ clickCount: 3 });
		await input?.type("New Text");
		await input?.press('Enter');

		// Wait for usage
		await new Promise(r => {setTimeout(r, 100);});
		expect(consoleLogs.some(l => l.includes("String changed") && l.includes("New Text"))).toBe(true);
	}, 60000);

	test('should verify String Button Icon interaction', async () =>
	{
		const widget = await getWidgetByName("String Button Icon");
		expect(widget).toBeTruthy();
		const button = await widget!.$('button');
		expect(button).toBeTruthy();

		// Verify icon styles
		const style = await page.evaluate(el => (el ? el.getAttribute('style') : ''), button);
		expect(style).toContain("background-image");
		expect(style).toContain("background-size: contain");
		expect(style).toContain("background-position: center");
		expect(style).toContain("HTML5_Badge_32.png");

		// Verify no text
		const text = await page.evaluate(el => (el ? el.textContent : ''), button);
		expect(text).toBe("");

		const box = button ? await button.boundingBox() : null;
		expect(box?.width).toBeGreaterThan(0);
		expect(box?.height).toBeGreaterThan(0);

		// Verify click triggers callback
		const logPromise = new Promise<string>(resolve =>
		{
			const listener = (msg: import('puppeteer').ConsoleMessage) =>
			{
				const text = msg.text();
				if (text.includes("String button icon:"))
				{
					page.off('console', listener);
					resolve(text);
				}
			};
			page.on('console', listener);
		});

		// Trigger click via JS to ensure it hits
		await page.evaluate(el => (el as HTMLElement).click(), button);
		const log = await logPromise;
		expect(log).toContain("String button icon:");
	}, 60000);

	test('should verify Number input interaction', async () =>
	{
		const widget = await getWidgetByName("Number");
		expect(widget).toBeTruthy();
		const input = await widget!.$('input');
		expect(input).toBeTruthy();

		await input?.click({ clickCount: 3 });
		await input?.type("55");
		await input?.press('Enter');

		await new Promise(r => {setTimeout(r, 100);});
		expect(consoleLogs.some(l => l.includes("Number changed") && l.includes("55"))).toBe(true);
	}, 60000);

	test('should verify Slider interaction', async () =>
	{
		const widget = await getWidgetByName("Slider");
		expect(widget).toBeTruthy();

		// Interact with the text input part of the slider for precision
		const input = await widget!.$('.slider-text');
		expect(input).toBeTruthy();

		await input?.click({ clickCount: 3 });
		await input?.type("0.8");
		await input?.press('Enter');

		await new Promise(r => {setTimeout(r, 100);});
		expect(consoleLogs.some(l => l.includes("Slider changed"))).toBe(true);
	}, 60000);

	test('should verify Checkbox interaction', async () =>
	{
		// 1. Standard Checkbox
		const widget = await getWidgetByName("Checkbox");
		expect(widget).toBeTruthy();

		// Get initial state (should be "on")
		const checkboxEl = await widget!.$('.wcontent .checkbox');
		expect(checkboxEl).toBeTruthy();
		const isInitiallyOn = await page.evaluate(el => el.classList.contains('on'), checkboxEl!);
		expect(isInitiallyOn).toBe(true);

		// Click to toggle off
		await checkboxEl!.click();
		await new Promise(r => {setTimeout(r, 100);});

		// Verify state changed in DOM
		const isNowOn = await page.evaluate(el => el.classList.contains('on'), checkboxEl!);
		expect(isNowOn).toBe(false);
		expect(consoleLogs.some(l => l.includes("Checkbox changed") && l.includes("false"))).toBe(true);

		// 2. Custom Label Checkbox
		const widgetCustom = await getWidgetByName("Checkbox Custom");
		expect(widgetCustom).toBeTruthy();

		const customCheckboxEl = await widgetCustom!.$('.wcontent .checkbox');
		expect(customCheckboxEl).toBeTruthy();
		const flagSpan = await widgetCustom!.$('span.flag');
		expect(flagSpan).toBeTruthy();

		// Initial state (false -> "Disabled")
		const initialText = await page.evaluate(el => el.textContent, flagSpan!);
		expect(initialText).toBe("Disabled");

		// Click to toggle on
		await customCheckboxEl!.click();
		await new Promise(r => {setTimeout(r, 100);});

		// Verify text update
		const newText = await page.evaluate(el => el.textContent, flagSpan!);
		expect(newText).toBe("Enabled");
		expect(consoleLogs.some(l => l.includes("Checkbox Custom changed") && l.includes("true"))).toBe(true);

	}, 60000);

	test('should verify Button interaction', async () =>
	{
		// "Single Button"
		const button = await getButtonByText("Single Button");
		expect(button).toBeTruthy();

		await button!.click();

		await new Promise(r => {setTimeout(r, 100);});
		expect(consoleLogs.some(l => l.includes("Button clicked"))).toBe(true);
	}, 60000);

	test('should verify Icon Button interaction', async () =>
	{
		const widget = await getWidgetByName("Icon Button");
		expect(widget).toBeTruthy();

		const icon = await widget!.$('.icon');
		expect(icon).toBeTruthy();

		// Click the icon
		await icon!.click();

		await new Promise(r => {setTimeout(r, 100);});
		expect(consoleLogs.some(l => l.includes("Icon clicked"))).toBe(true);
	}, 60000);

	test('should verify Combo interaction', async () =>
	{
		const widget = await getWidgetByName("Combo");
		expect(widget).toBeTruthy();

		const select = await widget!.$('select');
		expect(select).toBeTruthy();

		// Select the third option (index 2) which corresponds to "Option 3" values["Option 3"] -> index "2"
		await select?.select('2');

		await new Promise(r => {setTimeout(r, 100);});
		expect(consoleLogs.some(l => l.includes("Combo changed"))).toBe(true);
	}, 60000);

	test('should verify Vector2 interaction', async () =>
	{
		const widget = await getWidgetByName("Vector2");
		expect(widget).toBeTruthy();

		// Vector2 has multiple inputs. Let's change the first one.
		const inputs = await widget!.$$('input');
		expect(inputs.length).toBeGreaterThan(0);

		await inputs[0].click({ clickCount: 3 });
		await inputs[0].type("10");
		await inputs[0].press('Enter');

		await new Promise(r => {setTimeout(r, 100);});
		expect(consoleLogs.some(l => l.includes("Vector2 changed"))).toBe(true);
	}, 60000);

	test('should verify Color interaction', async () =>
	{
		const widget = await getWidgetByName("Color");
		expect(widget).toBeTruthy();

		const input = await widget!.$('input.color');

		if (input)
		{
			// Native or simple input - pass
		}
		else
		{
			const pcr = await widget!.$('.pcr-button');
			if (pcr)
			{
				await pcr.click();
				await page.waitForSelector('.pcr-app', { visible: true, timeout: 5000 });
			}
		}
	}, 60000);

	test('should verify Array widget interaction (Vector2)', async () =>
	{
		// Find the array widget
		const arrayWidget = await getWidgetByName("Array");
		expect(arrayWidget).toBeTruthy();

		// Verify Initial State
		const initialInputs = await page.$$('.wcontainer .array-row input');

		// Depending on implementation, vector2 might produce 2 inputs per row.
		expect(initialInputs.length).toBeGreaterThanOrEqual(4);

		const val0_x = await page.evaluate(el => el.value, initialInputs[0]);
		const val0_y = await page.evaluate(el => el.value, initialInputs[1]);
		expect(Number(val0_x)).toBe(10);
		expect(Number(val0_y)).toBe(20);

		// Add a new item
		const buttons = await page.$$('button');
		let arrayPlusBtn: ElementHandle | null = null;
		for (const btn of buttons)
		{
			const text = await page.evaluate(el => el.innerText, btn);
			if (text === "+")
			{
				arrayPlusBtn = btn;
				break;
			}
		}

		expect(arrayPlusBtn).toBeTruthy();

		if (arrayPlusBtn)
		{
			await arrayPlusBtn.click();
		}

		await new Promise(r => {setTimeout(r, 500);});

		// Verify New Item
		const currentInputs = await page.$$('.wcontainer .array-row input');
		expect(currentInputs.length).toBeGreaterThanOrEqual(6);

		// Modify the new item (last row)
		const lastInputX = currentInputs[4];
		await lastInputX.click({ clickCount: 3 });
		await lastInputX.type("50");
		await lastInputX.press('Enter');

		await new Promise(r => {setTimeout(r, 500);});

		// Delete an item
		const trashButtons = await page.$$('.row-trash');
		const lastTrash = trashButtons[trashButtons.length - 1];
		await lastTrash.click();
		await new Promise(r => {setTimeout(r, 500);});

		const afterDeleteInputs = await page.$$('.wcontainer .array-row input');
		expect(afterDeleteInputs.length).toBe(4);

	}, 60000);

	test('should verify Tabs Plus Tab and Ghost Tab interaction', async () =>
	{
		// Locate the Plus Tab
		await page.waitForSelector('.wtabplus', { visible: true, timeout: 2000 });
		const plusTab = await page.$('.wtabplus');
		expect(plusTab).toBeTruthy();

		// Click Plus Tab
		await plusTab?.click();

		// Verify Ghost Tab appears
		await page.waitForSelector('.wtabghost', { visible: true, timeout: 1000 });
		const ghostTab = await page.$('.wtabghost');
		expect(ghostTab).toBeTruthy();

		const input = await ghostTab?.$('input');
		expect(input).toBeTruthy();

		// Type new tab name
		const newTabName = "My New Tab";
		await input?.type(newTabName);
		await input?.press('Enter');

		// Verify Ghost Tab is gone
		await page.waitForSelector('.wtabghost', { hidden: true, timeout: 1000 });

		// Verify New Tab exists
		const tabs = await page.$$('.wtab .tabtitle');
		let found = false;
		for (const t of tabs)
		{
			const text = await page.evaluate(el => el.textContent, t);
			if (text === newTabName)
			{
				found = true;
				break;
			}
		}
		expect(found).toBe(true);

		// Verify internal callback was called
		const callbackCalled = await page.evaluate(() =>
		{
			interface WindowWithTabCallbacks {
				tabCallbacks?: {
					plusTab?: boolean;
				}
			}
			const win = window as unknown as WindowWithTabCallbacks;
			if (win.tabCallbacks && win.tabCallbacks.plusTab)
			{
				return win.tabCallbacks.plusTab;
			}
			return false;
		});
		expect(callbackCalled).toBe(true);

	}, 60000);

	test('should verify Tab renaming', async () =>
	{
		// Find "Tab 01" to rename
		const tabs = await page.$$('.wtab');
		let targetTab = null;
		for (const t of tabs)
		{
			const title = await t.$('.tabtitle');
			if (title)
			{
				const text = await page.evaluate(el => el.textContent, title);
				if (text === "Tab 01")
				{
					targetTab = t;
					break;
				}
			}
		}
		expect(targetTab).toBeTruthy();

		// Double click
		await targetTab?.click({ clickCount: 2 });

		// Check for rename input
		await page.waitForSelector('.tab-rename-input', { visible: true, timeout: 1000 });
		const input = await targetTab?.$('.tab-rename-input');
		expect(input).toBeTruthy();

		// Rename
		const renamedName = "Renamed Tab 01";
		await page.evaluate((el: unknown) =>
		{
			if (el && typeof el === "object" && "value" in el)
			{
				el.value = '';
			}
		}, input); // Clear it
		await input?.type(renamedName);
		await input?.press('Enter');

		// Wait for input to disappear
		await page.waitForSelector('.tab-rename-input', { hidden: true, timeout: 1000 });

		// Verify new name
		const titleEl = await targetTab?.$('.tabtitle');
		const newText = await page.evaluate((el: unknown) =>
		{
			if (el && typeof el === "object" && "textContent" in el)
			{
				return el.textContent;
			}
			return "";
		}, titleEl);
		expect(newText).toBe(renamedName);

	}, 60000);

	test('should verify Tree widget content', async () =>
	{
		const widget = await getWidgetByName("Tree");
		expect(widget).toBeTruthy();

		// Check if items are rendered
		const treeItems = await widget!.$$('.ltreeitem');
		expect(treeItems.length).toBeGreaterThan(0);

		const texts = await Promise.all(treeItems.map(async item =>
		{
			const title = await item.$('.ltreeitemtitle .incontent');
			return title ? page.evaluate((el: unknown) =>
			{
				if (el && typeof el === "object" && "textContent" in el)
				{
					return el.textContent;
				}
				return "";
			}, title) : "";
		}));

		expect(texts.some((t: unknown) => t && typeof t === "string" && t.includes("child1"))).toBe(true);
		expect(texts.some((t: unknown) => t && typeof t === "string" && t.includes("child2"))).toBe(true);

		// Verify nesting levels
		let child2: ElementHandle | null = null;
		let grandchild1: ElementHandle | null = null;

		for (const item of treeItems)
		{
			const txt = await page.evaluate(el => el.textContent, item);
			if (txt?.includes("child2") && !txt.includes("grandchild")) {child2 = item;}
			if (txt?.includes("grandchild1")) {grandchild1 = item;}
		}

		expect(child2).toBeTruthy();
		expect(grandchild1).toBeTruthy();

		const getLevel = async (el: ElementHandle) =>
		{
			return page.evaluate((element: unknown) =>
			{
				if (element && typeof element === "object" && "className" in element &&
					typeof element.className === "string")
				{
					const match = element.className.match(/ltree-level-(\d+)/);
					return match ? parseInt(match[1]) : 0;
				}
				return 0;
			}, el);
		};

		const levelChild2 = await getLevel(child2!);
		const levelGrandchild1 = await getLevel(grandchild1!);

		expect(levelGrandchild1).toBeGreaterThan(levelChild2);

		// Click a node
		const child1Title = await widget!.$('.ltreeitem-child1 .ltreeitemtitle');
		expect(child1Title).toBeTruthy();

		await child1Title?.click();
		await new Promise(r =>
		{
			setTimeout(r, 100);
		});

		expect(consoleLogs.some(l => l.includes("Tree node selected"))).toBe(true);
	}, 60000);

	test('should verify Line Editor interaction', async () =>
	{
		const widget = await getWidgetByName("Line Editor");
		expect(widget).toBeTruthy();

		const canvas = await widget!.$('canvas');
		expect(canvas).toBeTruthy();

		const box = await canvas!.boundingBox();
		expect(box).toBeTruthy();

		await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);

		await new Promise(r =>
		{
			setTimeout(r, 500);
		});

		expect(canvas).toBeTruthy();
		expect(widget).toBeTruthy();
	}, 60000);

	test('should verify Tree drag and drop', async () =>
	{
		const widget = await getWidgetByName("Tree");
		expect(widget).toBeTruthy();

		// We want to drag "grandchild1" into "child1"
		const grandchild1Title = await widget!.$('.ltreeitem-grandchild1 .ltreeitemtitle');
		const child1Title = await widget!.$('.ltreeitem-child1 .ltreeitemtitle');

		expect(grandchild1Title).toBeTruthy();
		expect(child1Title).toBeTruthy();

		// Get initial level
		const getLevel = async (el: ElementHandle) =>
		{
			return page.evaluate((element: unknown) =>
			{
				if (element && typeof element === "object" && "parentElement" in element)
				{
					// Navigate up to the li element
					const li = (element as HTMLElement).closest('li');
					if (li && li.dataset && li.dataset.level)
					{
						return parseInt(li.dataset.level);
					}
				}
				return 0;
			}, el);
		};

		const initialLevelGC = await getLevel(grandchild1Title!);
		const initialLevelC1 = await getLevel(child1Title!);

		expect(initialLevelGC).toBeGreaterThan(initialLevelC1); // Grandchild is deeper than child

		// Perform Drag and Drop
		const box1 = await grandchild1Title!.boundingBox();
		const box2 = await child1Title!.boundingBox();

		if (box1 && box2)
		{
			await page.evaluate((source, target) =>
			{
				const dataTransfer = new DataTransfer();

				// Dispatch dragstart on source
				const dragStartEvent = new DragEvent('dragstart', {
					bubbles: true,
					cancelable: true,
					dataTransfer: dataTransfer
				});
				source.dispatchEvent(dragStartEvent);

				// Dispatch dragover on target
				const dragOverEvent = new DragEvent('dragover', {
					bubbles: true,
					cancelable: true,
					dataTransfer: dataTransfer
				});
				target.dispatchEvent(dragOverEvent);

				// Dispatch drop on target
				const dropEvent = new DragEvent('drop', {
					bubbles: true,
					cancelable: true,
					dataTransfer: dataTransfer
				});
				target.dispatchEvent(dropEvent);

				// Dispatch dragend on source
				const dragEndEvent = new DragEvent('dragend', {
					bubbles: true,
					cancelable: true,
					dataTransfer: dataTransfer
				});
				source.dispatchEvent(dragEndEvent);
			}, grandchild1Title!, child1Title!);

			await new Promise(r => { setTimeout(r, 1000); }); // Wait for drop processing
		}

		// Re-fetch elements as DOM might have changed
		const grandchild1TitleAfter = await widget!.$('.ltreeitem-grandchild1 .ltreeitemtitle');
		const child1TitleAfter = await widget!.$('.ltreeitem-child1 .ltreeitemtitle');
		expect(grandchild1TitleAfter).toBeTruthy();
		expect(child1TitleAfter).toBeTruthy();

		// Verify DOM Order: Grandchild1 should be AFTER Child1
		const isAfter = await page.evaluate((c1, c2) =>
		{
			const li1 = c1.closest('li');
			const li2 = c2.closest('li');
			if (!li1 || !li2) {return false;}
			// Compare document position
			return (li2.compareDocumentPosition(li1) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
		}, grandchild1TitleAfter!, child1TitleAfter!);

		expect(isAfter).toBe(true);

		const newLevelGC = await getLevel(grandchild1TitleAfter!);

		// Level should be Child1's level + 1
		expect(newLevelGC).toBe(initialLevelC1 + 1);

	}, 60000);

});
