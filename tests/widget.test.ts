import { LiteGUI } from "../src/core";

describe('Construct button', () =>
{
	it(`Should create button`, () =>
	{
		expect(new LiteGUI.Button("Button01", {})).toBeDefined();
	});
});

describe('click button', () =>
{
	const button = new LiteGUI.Button("Button01", { callback: () => { } });
	it(`Should click button`, () =>
	{
		expect(() => button.click()).not.toThrow();
	});
});

describe('Construct searchbox', () =>
{
	it(`Should construct searchbox`, () =>
	{
		expect(new LiteGUI.SearchBox("Searchbox01", { callback: () => { }, placeholder: "type to search" })).toBeDefined();
	});
});

describe('setValue searchbox', () =>
{
	const searchbox = new LiteGUI.SearchBox("Searchbox01", { callback: () => { }, placeholder: "type to search" });
	it(`Should set generich search`, () =>
	{
		searchbox.setValue("generic search");
		expect(searchbox.getValue()).toBe("generic search");
	});
});

describe('getValue searchbox', () =>
{
	const searchbox = new LiteGUI.SearchBox("Searchbox01", { placeholder: "type to search" });
	searchbox.setValue("generich search");
	it(`Should get generich search`, () =>
	{
		expect(searchbox.getValue()).toBe("generich search");
	});
});

describe('Construct ContextMenu', () =>
{
	const values = ["Value1", "Value2", "Value3"];
	const options = { title: "Generic Title" };
	it(`Should construct contextMenu`, () =>
	{
		expect(new LiteGUI.ContextMenu(values, options)).toBeDefined();
	});
});

describe('close ContextMenu', () =>
{
	const values = ["Value1", "Value2", "Value3"];
	const options = { title: "Generic Title" };
	const context = new LiteGUI.ContextMenu(values, options);
	it(`Should close the contextMenu`, () =>
	{
		const evt = {
			preventDefault: () => { },
			x: 10,
			pageX: 10
		} as MouseEvent;
		expect(() => context.close(evt, false)).not.toThrow();
	});
});

describe('getTopMenu ContextMenu', () =>
{
	const values = ["Value1", "Value2", "Value3"];
	const options = { title: "Generic Title" };
	const context = new LiteGUI.ContextMenu(values, options);
	it(`Should get the topMenu`, () =>
	{
		expect(context.getTopMenu()).toBeDefined();
	});
});

describe('getFirstEvent ContextMenu', () =>
{
	const values = ["Value1", "Value2", "Value3"];
	const options = { title: "Generic Title" };
	const context = new LiteGUI.ContextMenu(values, options);
	it(`Should get Valor1`, () =>
	{
		expect(context.getFirstEvent()).toBeUndefined();
	});
});

describe('construct Checkbox', () =>
{
	it(`Should construct checkbox`, () =>
	{
		expect(new LiteGUI.Checkbox(false, () => { })).toBeDefined();
	});
});

describe('setValue Checkbox', () =>
{
	const check = new LiteGUI.Checkbox(false, () => { });
	it(`Should set it as true`, () =>
	{
		check.setValue(true);
		expect(check.getValue()).toBe(true);
	});
});

describe('getValue Checkbox', () =>
{
	const check = new LiteGUI.Checkbox(false, () => { });
	check.setValue(true);
	it(`Should get a true`, () =>
	{
		expect(check.getValue()).toBe(true);
	});
});

describe('onClick Checkbox', () =>
{
	const check = new LiteGUI.Checkbox(false, () => { });
	it(`Should click in it`, () =>
	{
		expect(() => check.onClick()).not.toThrow();
		expect(check.getValue()).toBe(true);
	});
});

describe('createCheckbox litebox', () =>
{
	it(`Should create listBox`, () =>
	{
		expect(new LiteGUI.ListBox(true, () => { })).toBeDefined();
	});
});

describe('setValue litebox', () =>
{
	const litebox = new LiteGUI.ListBox(true, () => { });
	it(`Should set as true`, () =>
	{
		litebox.setValue(true);
		expect(litebox.getValue()).toBe("open");
	});
});

describe('getElement litebox', () =>
{
	const litebox = new LiteGUI.ListBox(true, () => { });
	it(`Should get element`, () =>
	{
		expect(litebox.getValue()).toBeDefined();
	});
});

describe('Construct List', () =>
{
	interface item
	{
		name: string,
		title: string,
		id: string
	}

	const items: item[] = [
		{ name: "Pos0", title: "Title0", id: "Pos0" },
		{ name: "Pos1", title: "Title1", id: "Pos1" },
		{ name: "Pos2", title: "Title2", id: "Pos2" },
		{ name: "Pos3", title: "Title3", id: "Pos3" },
	];
	it(`Should construct list`, () =>
	{
		expect(new LiteGUI.List("List01", items, { callback: () => { } })).toBeDefined();
	});
});

describe('getSelectedItem List', () =>
{
	interface item
	{
		name: string,
		title: string,
		id: string
	}

	const items: item[] = [
		{ name: "Pos0", title: "Title0", id: "Pos0" },
		{ name: "Pos1", title: "Title1", id: "Pos1" },
		{ name: "Pos2", title: "Title2", id: "Pos2" },
		{ name: "Pos3", title: "Title3", id: "Pos3" },
	];
	const list = new LiteGUI.List("List01", items, { callback: () => { } });
	list.setSelectedItem("Pos1");
	it(`Should get Pos1, title 1`, () =>
	{
		const selected = list.getSelectedItem();
		expect(selected).toBeDefined();
	});
});

describe('setSelectedItem List', () =>
{
	interface item
	{
		name: string,
		title: string,
		id: string
	}

	const items: item[] = [
		{ name: "Pos0", title: "Title0", id: "Pos0" },
		{ name: "Pos1", title: "Title1", id: "Pos1" },
		{ name: "Pos2", title: "Title2", id: "Pos2" },
		{ name: "Pos3", title: "Title3", id: "Pos3" },
	];
	const list = new LiteGUI.List("List01", items, { callback: () => { } });
	it(`Should select Pos1`, () =>
	{
		expect(() => list.setSelectedItem("Pos1")).not.toThrow();
		expect(list.getSelectedItem()).toBeDefined();
	});
});

describe('Construct Slider', () =>
{
	it(`Should construct slider`, () =>
	{
		expect(new LiteGUI.Slider(0.3, { min: 0, max: 1 })).toBeDefined();
	});
});

describe('setFromX Slider', () =>
{
	const slider = new LiteGUI.Slider(0.3, { min: 0, max: 1 });
	it(`Should set x in 1`, () =>
	{
		expect(() => slider.setFromX(1)).not.toThrow();
	});
});

describe('onMouseMove Slider', () =>
{
	const slider = new LiteGUI.Slider(0.3, { min: 0, max: 1 });
	it(`Should move mouse`, () =>
	{
		const evt = {
			preventDefault: () => { },
			x: 10,
			pageX: 10
		};
		expect(() => slider.onMouseMove(evt as unknown as MouseEvent)).not.toThrow();
	});
});

describe('onMouseUp Slider', () =>
{
	const slider = new LiteGUI.Slider(0.3, { min: 0, max: 1 });
	it(`Should up the click`, () =>
	{
		const evt = {
			preventDefault: () => { }
		};
		expect(() => slider.onMouseUp(evt as unknown as MouseEvent)).not.toThrow();
	});
});

describe('setValue Slider', () =>
{
	const slider = new LiteGUI.Slider(0.3, { min: 0, max: 1 });
	it(`Should down the click`, () =>
	{
		slider.setValue(0.3, false);
		expect(slider.value).toBeCloseTo(0.3);
	});
});

describe('Construct LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	it(`Should construct lineEditor`, () =>
	{
		expect(new LiteGUI.LineEditor(valuesArray, {})).toBeDefined();
	});
});

describe('getValueAt LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should value at half`, () =>
	{
		expect(lineEditor.getValueAt(0.5)).toBeDefined();
	});
});

describe('resample LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should sample in 4`, () =>
	{
		expect(lineEditor.resample(4)).toBeDefined();
	});
});

describe('addValue LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should add 300,300`, () =>
	{
		lineEditor.addValue([300, 300]);
		expect(lineEditor.root.valuesArray).toContainEqual([300, 300]);
	});
});

describe('convert LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should convert 300,300`, () =>
	{
		expect(lineEditor.convert([300, 300])).toBeDefined();
	});
});

describe('unconvert LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should unconvert 300,300`, () => // Name of test
	{
		expect(lineEditor.deconvert([300, 300])).toBeDefined();
	});
});

describe('redraw LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	// LineEditor.redraw();

	it(`Should add 300,300 and redraw it`, () =>
	{
		lineEditor.addValue([300, 300]);
		expect(() => lineEditor.redraw()).not.toThrow();
	});
});

describe('onmousedown LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	const evt = {
		view: global,
		bubbles: true,
		cancelable: true,
		clientX: 0,
		clientY: 0,
		preventDefault: () => { },
		stopPropagation: () => { }
	};
	it(`Should mouse down`, () =>
	{
		expect(() => lineEditor.onMouseDown(evt as unknown as MouseEvent)).not.toThrow();
	});
});

describe('onmousemove LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	const evt = {
		view: global,
		bubbles: true,
		cancelable: true,
		clientX: 0,
		clientY: 0,
		preventDefault: () => { },
		stopPropagation: () => { }
	};
	it(`Should mouse move`, () =>
	{
		expect(() => lineEditor.onMouseMove(evt as unknown as MouseEvent)).not.toThrow();
	});
});

describe('onmouseup LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	const evt = {
		view: global,
		bubbles: true,
		cancelable: true,
		clientX: 0,
		clientY: 0,
		preventDefault: () => { },
		stopPropagation: () => { },
	};
	it(`Should mouse up`, () =>
	{
		expect(() => lineEditor.onMouseUp(evt as unknown as MouseEvent)).not.toThrow();
	});
});

describe('onresize LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should resize it`, () =>
	{
		expect(() => lineEditor.onResize()).not.toThrow();
	});
});

describe('onchange LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should trigger the on change`, () =>
	{
		expect(() => lineEditor.onChange()).not.toThrow();
	});
});

describe('distance LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should be 70.71`, () =>
	{
		const dist = lineEditor.distance(valuesArray[1] as [number, number],
			valuesArray[2] as [number, number]);
		expect(dist).toBeCloseTo(70.71, 2);
	});
});

describe('computeSelected LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should compute 0,0`, () =>
	{
		expect(lineEditor.computeSelected(0, 0)).toBeGreaterThanOrEqual(-1);
	});
});

describe('sortValues LineEditor', () =>
{
	const valuesArray = [[0, 0], [50, 50], [100, 100], [200, 200]];
	const lineEditor = new LiteGUI.LineEditor(valuesArray, {});
	it(`Should sort the values`, () =>
	{
		expect(() => lineEditor.sortValues()).not.toThrow();
	});
});

describe('Construct ComplexList', () =>
{
	it(`Should construct complexList`, () =>
	{
		expect(new LiteGUI.ComplexList({ height: 50 })).toBeDefined();
	});
});

describe('addTitle ComplexList', () =>
{
	const list = new LiteGUI.ComplexList({ height: 50 });
	it(`Should add titulo de lista`, () =>
	{
		expect(list.addTitle("Titulo de lista")).toBeDefined();
	});
});

describe('addHTML ComplexList', () =>
{
	const list = new LiteGUI.ComplexList({ height: 50 });
	const callableFunction = function () { };
	it(`Should aditional list`, () =>
	{
		expect(list.addHTML("aditional list", callableFunction)).toBeDefined();
	});
});

describe('clear ComplexList', () =>
{
	const list = new LiteGUI.ComplexList({ height: 50 });
	it(`Should clear it`, () =>
	{
		expect(() => list.clear()).not.toThrow();
	});
});

describe('addItem ComplexList', () =>
{
	const list = new LiteGUI.ComplexList({ height: 50 });
	const item = document.createElement("div") as HTMLDivElement;
	it(`Should add generic item`, () =>
	{
		expect(list.addItem(item, "item", true, true)).toBeDefined();
	});
});

describe('ComplexList addItem with callbacks', () =>
{
	it('should call onItemSelected when item is clicked', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const onItemSelected = jest.fn();
		list.onItemSelected = onItemSelected;

		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test Label", true, true);

		listItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(onItemSelected).toHaveBeenCalledTimes(1);
		expect(onItemSelected.mock.calls[0][0]).toBe(itemData);
		expect(onItemSelected.mock.calls[0][1]).toBe(listItem);
	});

	it('should call onItemToggled when tick is clicked', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const onItemToggled = jest.fn();
		list.onItemToggled = onItemToggled;

		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, true);

		const tick = listItem.querySelector('.tick');
		expect(tick).not.toBeNull();

		tick!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(onItemToggled).toHaveBeenCalledTimes(1);
		expect(onItemToggled.mock.calls[0][2]).toBe(false);
	});

	it('should toggle enabled class on tick click', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, true);

		expect(listItem.classList.contains('enabled')).toBe(true);

		const tick = listItem.querySelector('.tick');
		tick!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(listItem.classList.contains('enabled')).toBe(false);
	});

	it('should call onItemRemoved when trash is clicked', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const onItemRemoved = jest.fn();
		list.onItemRemoved = onItemRemoved;

		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, true);

		const trash = listItem.querySelector('.trash');
		expect(trash).not.toBeNull();

		trash!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(onItemRemoved).toHaveBeenCalledTimes(1);
		expect(onItemRemoved.mock.calls[0][0]).toBe(itemData);
	});

	it('should remove item from DOM when trash is clicked', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, true);

		list.root.appendChild(listItem);

		expect(list.root.contains(listItem)).toBe(true);

		const trash = listItem.querySelector('.trash');
		trash!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(list.root.contains(listItem)).toBe(false);
	});

	it('should update selected property on item click', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, true);

		listItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(list.selected).toBe(itemData);
	});

	it('should apply selected class when item is selected', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const itemData1 = document.createElement("div");
		itemData1.id = "item1";
		const itemData2 = document.createElement("div");
		itemData2.id = "item2";
		const item1 = list.addItem(itemData1, "Item 1", true, true);
		const item2 = list.addItem(itemData2, "Item 2", true, true);

		item1.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(item1.classList.contains('selected')).toBe(true);
		expect(item2.classList.contains('selected')).toBe(false);

		item2.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(item1.classList.contains('selected')).toBe(false);
		expect(item2.classList.contains('selected')).toBe(true);
	});

	it('should hide item when hide() is called', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, true);

		listItem.hide();

		expect(listItem.style.display).toBe('none');
	});

	it('should show item when show() is called', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, true);

		listItem.hide();
		listItem.show();

		expect(listItem.style.display).toBe('');
	});

	it('should set content as text by default', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const listItem = list.addItem(1, "Test", true, true);

		listItem.setContent("New Text", false);

		expect((listItem.querySelector('.title') as HTMLElement)?.innerText).toBe("New Text");
	});

	it('should set content as HTML when isHTML is true', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const listItem = list.addItem(1, "Test", true, true);

		listItem.setContent("<b>Bold Text</b>", true);

		expect(listItem.querySelector('.title')?.innerHTML).toBe("<b>Bold Text</b>");
	});

	it('should toggle enabled state with toggleEnabled()', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, true);

		expect(listItem.classList.contains('enabled')).toBe(true);

		listItem.toggleEnabled();

		expect(listItem.classList.contains('enabled')).toBe(false);

		listItem.toggleEnabled();

		expect(listItem.classList.contains('enabled')).toBe(true);
	});

	it('should hide trash button when canBeRemoved is false', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const itemData = document.createElement("div");
		itemData.id = "test-item";
		const listItem = list.addItem(itemData, "Test", true, false);

		const trash = listItem.querySelector('.trash');
		expect(trash).not.toBeNull();
		expect((trash as HTMLElement).style.display).toBe('none');
	});

	it('should handle item as number id', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const onItemSelected = jest.fn();
		list.onItemSelected = onItemSelected;

		const listItem = list.addItem(42, "Item 42", true, true);

		listItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(onItemSelected).toHaveBeenCalledWith(42, listItem);
	});
});

describe('ComplexList clear', () =>
{
	it('should clear all items from the list', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		list.addItem(1, "Item 1", true, true);
		list.addItem(2, "Item 2", true, true);
		list.addItem(3, "Item 3", true, true);

		expect(list.root.querySelectorAll('.listitem').length).toBe(3);

		list.clear();

		expect(list.root.querySelectorAll('.listitem').length).toBe(0);
	});

	it('should clear titles as well', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		list.addTitle("Section Title");
		list.addItem(1, "Item 1", true, true);

		list.clear();

		expect(list.root.querySelectorAll('.listtitle').length).toBe(0);
		expect(list.root.querySelectorAll('.listitem').length).toBe(0);
	});
});

describe('ComplexList addHTML', () =>
{
	it('should call onclick handler when clicked', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const onClick = jest.fn();
		const htmlElement = list.addHTML("<p>Custom HTML</p>", onClick);

		htmlElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('should add element to the list root', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const htmlElement = list.addHTML("<p>Custom HTML</p>", undefined);

		expect(list.root.contains(htmlElement)).toBe(true);
		expect(htmlElement.classList.contains('listtext')).toBe(true);
	});
});

describe('ComplexList addTitle', () =>
{
	it('should add title element to the list root', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		const titleElement = list.addTitle("My Title");

		expect(list.root.contains(titleElement)).toBe(true);
		expect(titleElement.classList.contains('listtitle')).toBe(true);
		expect(titleElement.textContent).toBe("My Title");
	});

	it('should handle multiple titles', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 50 });
		list.addTitle("Title 1");
		list.addTitle("Title 2");

		expect(list.root.querySelectorAll('.listtitle').length).toBe(2);
	});
});

describe('ComplexList options', () =>
{
	it('should apply height from options', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 200 });
		expect(list.root.style.height).toBe('200px');
	});

	it('should use custom itemCode if provided', () =>
	{
		const customCode = "<div class='custom'><span class='label'></span></div>";
		const list = new LiteGUI.ComplexList({ itemCode: customCode });
		const item = list.addItem(1, "Test", true, true);

		expect(item.classList.contains('custom')).toBe(true);
		expect(item.querySelector('.label')).not.toBeNull();
	});

	it('should accept number for height', () =>
	{
		const list = new LiteGUI.ComplexList({ height: 100 });
		expect(list.root.style.height).toBe('100px');
	});

	it('should use onItemSelected from options', () =>
	{
		const onItemSelected = jest.fn();
		const list = new LiteGUI.ComplexList({
			height: 50,
			onItemSelected: onItemSelected
		});

		const item = list.addItem(1, "Test", true, true);
		item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(onItemSelected).toHaveBeenCalledTimes(1);
	});

	it('should use onItemToggled from options', () =>
	{
		const onItemToggled = jest.fn();
		const list = new LiteGUI.ComplexList({
			height: 50,
			onItemToggled: onItemToggled
		});

		const item = list.addItem(1, "Test", true, true);
		const tick = item.querySelector('.tick');
		tick!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(onItemToggled).toHaveBeenCalledTimes(1);
	});

	it('should use onItemRemoved from options', () =>
	{
		const onItemRemoved = jest.fn();
		const list = new LiteGUI.ComplexList({
			height: 50,
			onItemRemoved: onItemRemoved
		});

		const item = list.addItem(1, "Test", true, true);
		const trash = item.querySelector('.trash');
		trash!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(onItemRemoved).toHaveBeenCalledTimes(1);
	});
});

describe('ContextMenu interaction', () =>
{
	it('should create a submenu and function restrictedly (current implementation)', () =>
	{
		const subOptions = { title: "Submenu Title", callback: jest.fn() };
		const subMenu = new LiteGUI.ContextMenu(["Ignored"], subOptions);

		const mainValues = [
			{ title: "Parent Item", submenu: subMenu, hasSubmenu: true }
		];
		const mainMenu = new LiteGUI.ContextMenu(mainValues);

		document.body.appendChild(mainMenu.root);

		const items = mainMenu.root.querySelectorAll(".litemenu-entry");
		const parentItem = Array.from(items).find((el: Element) => el.innerHTML.includes("Parent Item")) as HTMLElement;
		expect(parentItem).toBeDefined();

		parentItem.click();

		const menus = document.querySelectorAll(".litecontextmenu");
		expect(menus.length).toBeGreaterThan(1);

		const newMenu = menus[menus.length - 1] as HTMLElement;
		const subItems = newMenu.querySelectorAll(".litemenu-entry");

		expect(subItems.length).toBe(1);
		expect(subItems[0].textContent).toBe("Submenu Title");

		(subItems[0] as HTMLElement).click();
		expect(subOptions.callback).toHaveBeenCalled();

		mainMenu.close();
		document.querySelectorAll(".litecontextmenu").forEach(e => e.remove());
	});

	it('should execute callback on item click', () =>
	{
		const callback = jest.fn();
		const menu = new LiteGUI.ContextMenu([{ title: "Item 1", callback: callback }]);
		document.body.appendChild(menu.root);

		const item = menu.root.querySelector(".litemenu-entry") as HTMLElement;
		item.click();

		expect(callback).toHaveBeenCalled();
		menu.close();
	});

	it('should close on mouseleave after delay', () =>
	{
		jest.useFakeTimers();
		const menu = new LiteGUI.ContextMenu(["Item 1"]);
		document.body.appendChild(menu.root);

		menu.root.dispatchEvent(new MouseEvent('mouseleave'));

		expect(menu.root.parentNode).toBe(document.body);

		jest.runAllTimers();

		// Should be removed
		expect(menu.root.parentNode).toBeNull();

		jest.useRealTimers();
	});
});

describe('SearchBox edge cases', () =>
{
	it('should render the placeholder from options', () =>
	{
		const searchbox = new LiteGUI.SearchBox("", { placeholder: "Find something..." });
		expect(searchbox.input.placeholder).toBe("Find something...");
	});

	it('should use default placeholder when none provided', () =>
	{
		const searchbox = new LiteGUI.SearchBox("", {});
		expect(searchbox.input.placeholder).toBe("Search");
	});

	it('should execute callback when setValue is called', () =>
	{
		const callback = jest.fn();
		const searchbox = new LiteGUI.SearchBox("", { callback: callback });

		searchbox.setValue("test query");

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith("test query");
	});
});

