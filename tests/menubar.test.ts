import { Menubar } from "../src/menubar";
import { Panel } from "../src/panel";

describe("Test menu bar constructor", () =>
{
	const options = { autoOpen: true, sortEntries: false };
	it('Should create a menu bar', () =>
	{
		expect(new Menubar("Menubar01", options)).toBeDefined();
	});
});

describe('Clear the menu bar', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);
	it(`Should clear the menu bar`, () =>
	{
		expect(menu.clear());
	});
});

describe('AttachToPanel in menu', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);

	const options2 = {
		className: "panel-header", title: "Hello world mundo", content: "Hello world, esta es una prueba de creación de panel",
		width: "300", height: "150", position: [10, 10], scroll: true
	};
	const panel0 = new Panel("Panel01", options2);
	it(`Should attach menu to panel0`, () =>
	{
		expect(menu.attachToPanel(panel0));
	});
});

describe('Add to menu', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);
	let a = 0;
	const clickCallback = function ()
	{
		a++;
	};
	menu.add("Print", clickCallback);
	it(`Should add something to the menu and be greater than 0`, () =>
	{
		expect(menu.menu.length).toBeGreaterThan(0);
		expect(a).toBe(0);
	});
});

describe('Remove from menu', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);
	menu.add("Print");
	it('Should remove the recently added print', () =>
	{
		expect(menu.remove("Print"));
		expect(menu.menu.length).toBe(0);
	});
});

describe('Separator', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);
	menu.add("Print");
	menu.add("Print/Submenu1");
	menu.add("Print/Submenu2");
	menu.add("Print/Submenu3");

	menu.separator("Print", 2);
	it('Should separate the print', () =>
	{
		expect(menu.menu[0].children?.length).toBeGreaterThan(3);
	});
});

describe('Find menu', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);
	menu.add("Print");
	const menu2 = menu.findMenu("Print");
	it('Should find the print', () =>
	{
		expect(menu2).toBeDefined();
	});
});

describe('Update menu', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);
	menu.add("Print");
	it('Should update the menu', () =>
	{
		expect(menu.updateMenu());
	});
});

describe('Hide panels', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);
	it('Should hide panels', () =>
	{
		expect(menu.hidePanels());
	});
});

describe('Show open menu', () =>
{
	const options = { autoOpen: true, sortEntries: false };
	const menu = new Menubar("Menubar01", options);
	let a = 0;
	const clickCallbackmenu = function ()
	{
		a++;
	};
	menu.add("Print", clickCallbackmenu);

	const evt = new MouseEvent("click", {
		view: window,
		bubbles: true,
		cancelable: true,
		clientX: 0,
		clientY: 0
	});
	it('Should show menu resently opened', () =>
	{
		expect(menu.showMenu(menu.menu[0], evt, menu.root));
	});
	it('Should not be clicked', () =>
	{
		expect(a).toBe(0);
	});
});
