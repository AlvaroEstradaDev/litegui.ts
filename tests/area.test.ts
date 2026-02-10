import { Area, AreaOptions } from "../src/area";
import { LiteGUI } from "../src/core";

function Construct(options?: AreaOptions)
{
	LiteGUI.init();
	const mainArea = new Area({
		id: "mainArea", contentId: "canvasarea",
		height: "calc( 100% - 20px )",
		main: true,
		...options
	});
	LiteGUI.add(mainArea);
	return mainArea;
}

describe("Area Constructor Test", () =>
{
	it(`Should be defined:`, () =>
	{
		expect(Construct()).toBeDefined();
	});
});

describe('Split Test Vertical', () =>
{
	it('should Split Vertically', () =>
	{
		const area = Construct({
			onResize: () => { }
		});
		const direction = Area.VERTICAL;
		area.split(direction, [null, "100px"], true);
		const topArea = area.getSection(1);
		expect(topArea).toBeDefined();
	});
});

describe('Split Test Horizontally', () =>
{
	it('should Split Horizontally', () =>
	{
		const area = Construct({
			onResize: () => { }
		});
		const direction = Area.HORIZONTAL;
		area.split(direction, [null, "100px"], true);
		const rightArea = area.getSection(1);
		expect(rightArea).toBeDefined();
	});
});

describe('Split Test nested', () =>
{
	it('should Split Vertically and then Horizontally', () =>
	{
		const area = Construct({
			onResize: () => { }
		});
		area.split(Area.VERTICAL, [null, "100px"], true);
		const topArea = area.getSection(1);
		topArea!.split(Area.HORIZONTAL, [null, 340], true);
		const rightArea = topArea!.getSection(1);
		expect(rightArea).toBeDefined();
	});
});

describe('Set Area Size Test', () =>
{
	it('should set the Area size', () =>
	{
		const area = Construct({
			onResize: () => { }
		});
		const direction = Area.VERTICAL;
		const width = 100;
		area.split(direction, [null, "100px"], true);
		const topArea = area.getSection(1);
		area?.setAreaSize(area, width);
		expect(topArea).toBeDefined();
	});
});

describe('Merge Area Test', () =>
{
	it('should merge the Area', () =>
	{
		const area = Construct({
			onResize: () => { }
		});
		const direction = Area.VERTICAL;
		area.split(direction, [null, "100px"], true);
		area?.merge();
		expect(area.sections.length).toBe(0);
	});
});

describe('Add Object Area Test', () =>
{
	it('should add object to Area', () =>
	{
		const area = Construct({
			onResize: () => { }
		});
		const direction = Area.VERTICAL;
		area.split(direction, [null, "100px"], true);
		const docked = new LiteGUI.Panel("right_panel", { title: 'Docked panel' });
		const topArea = area.getSection(1);
		topArea?.add(docked);
		expect(topArea?.content).toBeDefined();
	});
});