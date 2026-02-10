import { CreateWidgetOptions, InspectorValue, InspectorWidget } from "../src/@types/Inspector";
import { Inspector } from "../src/inspector";
import { LineEditorElement } from "../src/widgets";
import { TreeData } from "../src/widgets/tree";

describe('Inspector Constructor Test', () =>
{
	const inspector = new Inspector();
	it(`Should be defined:`, () =>
	{
		expect(inspector).toBeDefined();
	});
	it('should get the stored values', () =>
	{
		expect(inspector.getValues()).toBeDefined();
	});
});

describe('Add Number Test', () =>
{
	const inspector = new Inspector();
	let width = 1000;
	inspector.addNumber("Width: ", 1000,
		{
			min: 1, step: 1, precision: 0, /* Add_dragger: true,*/ units: "px",
			onChange: function (value: number) { width = value; },
			callback: function (value: number) { width = value; }
		});
	const a = inspector.getValue("Width: ");
	it('number should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('number should be 1000', () =>
	{
		expect(a).toBe(width);
	});
});

describe('Add Vector 2 Test', () =>
{
	const inspector = new Inspector();
	const Point0V2 = { x: 200, y: 400 };
	const point0Callback = function (value: number[])
	{
		Point0V2.x = value[0];
		Point0V2.y = value[1];
	};
	inspector.addVector2("Point0", [Point0V2.x, Point0V2.y], {
		min: 0, max: 1, step: 0.01, precision: 2,
		onChange: function (value: number[]) { point0Callback(value); },
		callback: function (value: number[]) { point0Callback(value); }
	});
	const a = inspector.getValue("Point0");
	it('vector2 should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('vector2 should be [200, 400]', () =>
	{
		expect((a as number[])[0]).toBe(Point0V2.x);
		expect((a as number[])[1]).toBe(Point0V2.y);
	});
});

describe('Add Vector 3 Test', () =>
{
	const inspector = new Inspector();
	const Point0V3 = { x: 200, y: 400, z: 300 };
	const point0Callback = function (value: number[])
	{
		Point0V3.x = value[0];
		Point0V3.y = value[1];
		Point0V3.z = value[2];
	};
	inspector.addVector3("Vector3_0", [Point0V3.x, Point0V3.y, Point0V3.z], {
		min: 0, max: 1, step: 0.01, precision: 2,
		onChange: function (value: number[]) { point0Callback(value); },
		callback: function (value: number[]) { point0Callback(value); }
	});
	const a = inspector.getValue("Vector3_0");
	it('vector3 should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('vector3 should be [200, 400, 300]', () =>
	{
		expect((a as number[])[0]).toBe(Point0V3.x);
		expect((a as number[])[1]).toBe(Point0V3.y);
		expect((a as number[])[2]).toBe(Point0V3.z);
	});
});

describe('Add Vector 4 Test', () =>
{
	const inspector = new Inspector();
	const Point0V4 = { x: 200, y: 400, z: 300, w: 500 };
	const point0Callback = function (value: number[])
	{
		Point0V4.x = value[0];
		Point0V4.y = value[1];
		Point0V4.z = value[2];
		Point0V4.w = value[3];
	};
	inspector.addVector4("Vector4_0", [Point0V4.x, Point0V4.y, Point0V4.z, Point0V4.w], {
		min: 0, max: 1, step: 0.01, precision: 2,
		onChange: function (value: number[]) { point0Callback(value); },
		callback: function (value: number[]) { point0Callback(value); }
	});
	const a = inspector.getValue("Vector4_0");
	it('vector4 should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('vector4 should be [200, 400, 300, 500]', () =>
	{
		expect((a as number[])[0]).toBe(Point0V4.x);
		expect((a as number[])[1]).toBe(Point0V4.y);
		expect((a as number[])[2]).toBe(Point0V4.z);
		expect((a as number[])[3]).toBe(Point0V4.w);
	});
});

describe('Add Pad Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "Pad0";
	inspector.addPad(ObjName, [0.3, 0.5], (v: [number, number]) =>
	{
		return v;
	});
	const a = inspector.getValue(ObjName);
	it('pad should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('pad should be [0.3, 0.5]', () =>
	{
		expect((a as number[])[0]).toBe(0.3);
		expect((a as number[])[1]).toBe(0.5);
	});
});

describe('Add Info Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "Info0";
	const ObjInfo = "a really long silly text";
	inspector.addInfo(ObjName, ObjInfo);
	const a = inspector.getValue(ObjName);
	it('info should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('info should be "a really long silly text"', () =>
	{
		expect(a).toBe(ObjInfo);
	});
});

describe('Add Slider Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "slider0";
	const ObjValue = 10;
	inspector.addSlider(ObjName, ObjValue, { min: 1, max: 100, step: 1 });
	const a = inspector.getValue(ObjName);
	it('slider should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('slider should be 10', () =>
	{
		expect(a).toBe(ObjValue);
	});
});

describe('Add Checkbox Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "checkbox0";
	const ObjValue = true;
	inspector.addCheckbox(ObjName, ObjValue);
	const a = inspector.getValue(ObjName);
	it('checkbox should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('checkbox should be true', () =>
	{
		expect(a).toBe(ObjValue);
	});
});

describe('Add Flags Test', () =>
{
	const inspector = new Inspector();
	const ObjValue = { flag1: true, flag2: false, flag3: true };
	inspector.addFlags(ObjValue);
	const a = inspector.getValue("flag1");
	it('flag1 should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('flag1 should be true', () =>
	{
		expect(a).toBe(ObjValue.flag1);
	});
	const b = inspector.getValue("flag2");
	it('flag2 should be defined', () =>
	{
		expect(b).toBeDefined();
	});
	it('flag2 should be false', () =>
	{
		expect(b).toBe(ObjValue.flag2);
	});
	const c = inspector.getValue("flag3");
	it('flag3 should be defined', () =>
	{
		expect(c).toBeDefined();
	});
	it('flag3 should be true', () =>
	{
		expect(c).toBe(ObjValue.flag3);
	});
});

describe('Add Combo Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "combo0";
	const ObjValue = "javi";
	const enumValues = ["foo", "faa", "super largo texto que no cabe entero", "javi", "nada"];
	inspector.addCombo(ObjName, ObjValue, { values: enumValues });
	const a = inspector.getValue(ObjName);
	it('combo should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('combo should be "javi"', () =>
	{
		expect(a).toBe(ObjValue);
	});
});

describe('Add Combo Buttons Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "combobuttons0";
	const ObjValue = "javi";
	inspector.addComboButtons(ObjName, ObjValue);
	const a = inspector.getValue(ObjName);
	it('combo buttons should be defined', () =>
	{
		expect(a).toBeDefined();
	});
	it('combo buttons should be "javi"', () =>
	{
		expect(a).toBe(ObjValue);
	});
});

describe('Add Tags Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "tags0";
	const ObjValue = ["rap", "blues", "pop", "jazz"];
	inspector.addTags(ObjName, ObjValue);
	const a = inspector.getValue(ObjName);
	it('tags should be populated', () =>
	{
		expect(a).toBeDefined();
		for (const val of ObjValue)
		{
			expect((a as Record<string, boolean>)[val]).toBe(true);
		}
	});
});

describe('Add List Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "list0";
	const enumValues = ["rap", "blues", "pop", "jazz"];
	const list = inspector.addList(ObjName, enumValues, { selected: enumValues[0] });
	const a = inspector.getValue(ObjName);
	it('list should be defined', () =>
	{
		expect(list).toBeDefined();
	});
	it('list should be "rap"', () =>
	{
		expect(a).toBe(enumValues[0]);
	});
});

describe('Add Button Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "Serialize";
	const ObjValue = "Save";
	const button = inspector.addButton(ObjName, ObjValue,
		{
			callback: function ()
			{
			}
		});
	const a = inspector.getWidget(ObjName);
	it('button should be defined', () =>
	{
		expect(a).toBeDefined();
		expect(a).toBe(button);
	});
});


describe('Add Buttons Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "Serialize";
	const ObjValue = ["Save", "Load", "New"];
	inspector.addButtons(ObjName, ObjValue,
		{
			callback: function ()
			{
			}
		});
	const a = inspector.getWidget(ObjName);
	it('should Add Buttons', () =>
	{
		expect(a).toBeDefined();
	});
});

describe('Add Icon Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "Icon";
	const ObjValue = false;
	inspector.addIcon(ObjName, ObjValue,
		{
			callback: function ()
			{
			}
		});
	const a = inspector.getWidget(ObjName);
	it('should Add Icon', () =>
	{
		expect(a).toBeDefined();
	});
});

describe('Add Color Test', () =>
{
	it('should Add Color value', () =>
	{
		const inspector = new Inspector();
		const colorRef: [number, number, number, number] = [0, 1, 0, 255];
		inspector.addColor("Color", colorRef);
		const a = inspector.getValue("Color");
		expect(a).toBe(colorRef);
	});
});

describe('Add File Test', () =>
{
	it('should Add File', () =>
	{
		const inspector = new Inspector();
		const ObjName = "File";
		const ObjValue = "test.png";
		inspector.addFile(ObjName, ObjValue,
			{
				callback: function ()
				{
				}
			});
		const a = inspector.getWidget(ObjName);
		expect(a).toBeDefined();
	});
});

describe('Add Line Test', () =>
{
	it('should Add Line', () =>
	{
		const inspector = new Inspector();
		const ObjName = "Line";
		const ObjValue = [[0.5, 1], [0.75, 0.25]];
		inspector.addLineEditor(ObjName, ObjValue,
			{
				defaultY: 0,
				width: 120
			});
		const a = inspector.getValue(ObjName);
		expect(a).toBe(ObjValue);
	});
});

describe('Add Line Editor Callback Test', () =>
{
	it('should create LineEditor widget with correct initial value', () =>
	{
		const inspector = new Inspector();
		const ObjName = "LineCallback";
		const initialValue: number[][] = [[0, 0.5], [0.5, 1], [1, 0.5]];

		const widget = inspector.addLineEditor(ObjName, initialValue);

		expect(widget).toBeTruthy();

		const lineEditorSpan = widget.querySelector("span.line-editor");
		expect(lineEditorSpan).toBeTruthy();

		const curve = lineEditorSpan!.querySelector('.curve') as LineEditorElement;
		expect(curve).toBeTruthy();
		expect(Array.isArray(curve.valuesArray)).toBe(true);
		expect(curve.valuesArray.length).toBe(initialValue.length);
	});

	it('should return number[][] from getValue', () =>
	{
		const inspector = new Inspector();
		const ObjName = "LineValue";
		const initialValue: number[][] = [[0, 0.5], [0.5, 1], [1, 0.5]];

		inspector.addLineEditor(ObjName, initialValue, {});

		const retrieved = inspector.getValue(ObjName);
		expect(retrieved).toBeDefined();
		expect(Array.isArray(retrieved as number[][])).toBe(true);
		expect((retrieved as number[][]).length).toBe(initialValue.length);
		expect(Array.isArray((retrieved as number[][])[0])).toBe(true);
	});
});

describe('Add Tree Test', () =>
{
	it('should Add Tree', () =>
	{
		const inspector = new Inspector();
		const ObjName = "tree";
		const ObjValue: TreeData =
        {
        	person: "javi",
        	info:
            {
            	age: 32,
            	location: "barcelona"
            },
        	role: "worker"
        };
		inspector.addTree(ObjName, ObjValue);
		const a = inspector.getWidget(ObjName);
		expect(a).toBeDefined();
	});
});

describe('Add DataTree Test', () =>
{
	it('should Add DataTree', () =>
	{
		const inspector = new Inspector();
		const ObjName = "dataTree";
		const ObjValue =
        {
        	person: "javi",
        	info:
            {
            	age: 32,
            	location: "barcelona"
            },
        	role: "worker"
        };
		inspector.addDataTree(ObjName, ObjValue);
		const a = inspector.getWidget(ObjName);
		expect(a).toBeDefined();
	});
});

describe('Add Array Test', () =>
{
	const inspector = new Inspector();
	const ObjName = "array";
	const ObjValue = [0, 1, 2, 3, 4];
	inspector.addArray(ObjName, ObjValue);
	const a = inspector.getWidget(ObjName);
	it('should Add Array', () =>
	{
		expect(a).toBeDefined();
	});
});

describe('Add Container Test', () =>
{
	it('should Add Container', () =>
	{
		const inspector = new Inspector();
		const ObjName = "container";
		// Let ObjValue = [0, 1, 2, 3, 4];
		const a = inspector.addEmptyContainer({ id: ObjName });
		expect(a).toBeDefined();
	});
});

describe('Start Container Test', () =>
{
	it('should Start Container', () =>
	{
		const inspector = new Inspector();
		const ObjName = "container";
		const a = inspector.startContainer({ id: ObjName });
		expect(a).toBeDefined();
	});
});

describe('Add Section Test', () =>
{
	it('should Add Section', () =>
	{
		const inspector = new Inspector();
		const ObjName = "Text stuff";
		const a = inspector.addSection(ObjName);
		expect(a).toBeDefined();
	});
});

describe('Set/Get Current Section Test', () =>
{
	it('should Set/Get Current Section', () =>
	{
		const inspector = new Inspector();
		const ObjName = "Text stuff";
		const section = inspector.addSection(ObjName);
		inspector.setCurrentSection(section);
		const a = inspector.getCurrentSection();
		expect(a).toBe(section);
	});
});

describe('Begin Group Test', () =>
{
	it('should Begin Group', () =>
	{
		const inspector = new Inspector();
		const ObjName = "Group name";
		const a = inspector.beginGroup(ObjName);
		expect(a).toBeDefined();
	});
});

describe('Add Title Test', () =>
{
	it('should Add Title', () =>
	{
		const inspector = new Inspector();
		const ObjName = "Title";
		const a = inspector.beginGroup(ObjName);
		expect(a).toBeDefined();
	});
});

describe('Add String Test', () =>
{
	it('should Add String', () =>
	{
		const inspector = new Inspector();
		const name = "String";
		const value = "Hello";
		inspector.addString(name, value);
		const retrieved = inspector.getValue(name);
		expect(retrieved).toBe(value);

		const widget = inspector.getWidget(name);
		expect(widget).toBeDefined();
	});
});

describe('Add Text Area Test', () =>
{
	it('should Add Text Area', () =>
	{
		const inspector = new Inspector();
		const name = "Text";
		const value = "Line 1\nLine 2";
		inspector.addTextArea(name, value);
		const retrieved = inspector.getValue(name);
		expect(retrieved).toBe(value);
	});
});

describe('Add Separator Test', () =>
{
	it('should Add Separator', () =>
	{
		const inspector = new Inspector();
		const sep = inspector.addSeparator();
		expect(sep).toBeDefined();
		expect(sep.className).toContain("separator");
	});
});

// Mocks for Drag Events
class MockDataTransfer
{
	data: Record<string, string> = {};
	getData(format: string) { return this.data[format]; }
	setData(format: string, data: string) { this.data[format] = data; }
}

class MockDragEvent extends Event
{
	dataTransfer: MockDataTransfer;
	constructor(type: string, eventInitDict?: EventInit)
	{
		super(type, eventInitDict);
		this.dataTransfer = new MockDataTransfer();
	}
}

describe('Tree Dragging Test', () =>
{
	it('should verify tree items are draggable', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeDrag";
		const ObjValue: TreeData =
        {
        	id: "root",
        	children: [
        		{ id: "child1" },
        		{ id: "child2" }
        	]
        };
		// Enable Drag
		inspector.addTree(ObjName, ObjValue, { treeOptions: { allowDrag: true } });

		const widget = inspector.getWidget(ObjName);
		expect(widget).toBeDefined();
		if (!widget) {return;}

		const treeItems = widget.querySelectorAll('.ltreeitemtitle');
		expect(treeItems.length).toBeGreaterThan(0);

		// Check if draggable attribute is present on title elements
		for (let i = 0; i < treeItems.length; ++i)
		{
			expect(treeItems[i].getAttribute('draggable')).toBe('true');
		}
	});

	it('should move item correctly via moveItem', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeMove";
		const ObjValue: TreeData =
        {
        	id: "root",
        	children: [
        		{ id: "childA" },
        		{ id: "childB" }
        	]
        };

		const widget = inspector.addTree(ObjName, ObjValue, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}

		const tree = widget.tree;
		expect(tree).toBeDefined();

		const childA = tree.getItem('childA');
		const childB = tree.getItem('childB');

		expect(childA).toBeDefined();
		expect(childB).toBeDefined();

		const initialLevel = parseInt(childA!.dataset['level'] || '0');

		// Move childA to childB
		const result = tree.moveItem('childA', 'childB');

		expect(result).toBe(true);

		const newLevel = parseInt(tree.getItem('childA')!.dataset['level'] || '0');
		expect(newLevel).toBeGreaterThan(initialLevel);

		const parent = tree.getParent('childA');
		expect(parent).toBe(childB);

		// Verify DOM order
		const indexA = Array.prototype.indexOf.call(tree.root.children, childA);
		const indexB = Array.prototype.indexOf.call(tree.root.children, childB);

		expect(indexA).toBeGreaterThan(indexB);

		// Verify class name
		expect(childA!.classList.contains('ltree-level-' + newLevel)).toBe(true);
		expect(childA!.classList.contains('ltree-level-' + initialLevel)).toBe(false);
	});

	it('should move item correctly via moveItem into parent with existing children', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeMoveDeep";
		const ObjValue: TreeData =
        {
        	id: "root",
        	children: [
        		{ id: "childA" },
        		{
        			id: "childB",
        			children: [
        				{ id: "grandchildB1" }
        			]
        		}
        	]
        };

		const widget = inspector.addTree(ObjName, ObjValue, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;

		const childA = tree.getItem('childA');
		const childB = tree.getItem('childB');
		const grandchildB1 = tree.getItem('grandchildB1');

		// Move childA to childB (should be appended after grandchildB1)
		const result = tree.moveItem('childA', 'childB');
		expect(result).toBe(true);

		const parent = tree.getParent('childA');
		expect(parent).toBe(childB);

		const indexB = Array.prototype.indexOf.call(tree.root.children, childB);
		const indexGC = Array.prototype.indexOf.call(tree.root.children, grandchildB1);
		const indexA = Array.prototype.indexOf.call(tree.root.children, childA);

		expect(indexGC).toBeGreaterThan(indexB);
		expect(indexA).toBeGreaterThan(indexGC);

		expect(childA!.classList.contains('ltree-level-2')).toBe(true);
	});

	it('should insert child correctly when target is followed by other items', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeInsertionBug";
		const treeData: TreeData = {
			id: "root",
			children: [
				{ id: "item1" },
				{ id: "item2" },
				{ id: "item3" }
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;

		const item1 = tree.getItem('item1');
		const item2 = tree.getItem('item2');
		const item3 = tree.getItem('item3');

		// Move item1 into item2
		const result = tree.moveItem('item1', 'item2');
		expect(result).toBe(true);

		const parent = tree.getParent('item1');
		expect(parent).toBe(item2);

		// Verify DOM order: item2 -> item1 -> item3
		const index2 = Array.prototype.indexOf.call(tree.root.children, item2);
		const index1 = Array.prototype.indexOf.call(tree.root.children, item1);
		const index3 = Array.prototype.indexOf.call(tree.root.children, item3);

		expect(index1).toBeGreaterThan(index2);
		expect(index3).toBeGreaterThan(index1);
	});

	it('should insert child correctly when target has children (User Scenario)', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeUserBug";
		const treeData: TreeData = {
			id: "root",
			children: [
				{ id: "child1" },
				{
					id: "child2",
					children: [
						{ id: "grandchild1" }
					]
				}
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;

		const child1 = tree.getItem('child1');
		const child2 = tree.getItem('child2');
		const grandchild1 = tree.getItem('grandchild1');

		// Move child1 into child2
		const result = tree.moveItem('child1', 'child2');
		expect(result).toBe(true);

		const parent = tree.getParent('child1');
		expect(parent).toBe(child2);

		const index2 = Array.prototype.indexOf.call(tree.root.children, child2);
		const indexGC = Array.prototype.indexOf.call(tree.root.children, grandchild1);
		const index1 = Array.prototype.indexOf.call(tree.root.children, child1);

		expect(indexGC).toBeGreaterThan(index2);
		expect(index1).toBeGreaterThan(indexGC);

		// Verify level
		expect(child1!.classList.contains('ltree-level-2')).toBe(true);
	});

	it('should maintain hierarchy when moving a node with children into another node with children', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeHierarchyBug";
		const treeData: TreeData = {
			id: "root",
			children: [
				{
					id: "child1",
					children: [
						{ id: "grandchild1" }
					]
				},
				{
					id: "child2",
					children: [
						{ id: "grandchild2" }
					]
				},
				{
					id: "child3"
				}
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;

		const child1 = tree.getItem('child1');
		const child2 = tree.getItem('child2');
		const grandchild2 = tree.getItem('grandchild2');

		// Move child2 into child1
		const result = tree.moveItem('child2', 'child1');
		expect(result).toBe(true);

		/*
		 * Expected structure:
		 * root
		 *  - child1
		 *    - grandchild1
		 *    - child2
		 *      - grandchild2
		 *  - child3
		 */

		// Verify DOM order
		const nodes = Array.from(tree.root.querySelectorAll(".ltreeitem"));
		const ids = nodes.map(n => (n as HTMLElement).dataset.itemID);
		const relevantIds = ids.filter(id => ["child1", "grandchild1", "child2", "grandchild2", "child3"].includes(id || ""));
		const expectedOrder = ["child1", "grandchild1", "child2", "grandchild2", "child3"];

		expect(relevantIds).toEqual(expectedOrder);

		// Verify levels specifically
		const level1 = parseInt(child1!.dataset.level || "0"); // Level 1
		const levelGC1 = parseInt(tree.getItem("grandchild1")!.dataset.level || "0"); // Level 2
		const level2 = parseInt(child2!.dataset.level || "0"); // Level 2
		const levelGC2 = parseInt(grandchild2!.dataset.level || "0"); // Level 3

		expect(levelGC1).toBeGreaterThan(level1);
		expect(level2).toBeGreaterThan(level1); // Child2 is now child of child1
		expect(levelGC2).toBeGreaterThan(level2); // Grandchild2 is child of child2

	});

	it('should re-enable hover highlight after a drop', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeHoverBug";
		const treeData: TreeData = {
			id: "root",
			children: [
				{ id: "target" },
				{ id: "source" }
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;

		const target = tree.getItem('target');
		expect(target).toBeDefined();
		const titleElement = target!.querySelector('.ltreeitemtitle') as HTMLElement;
		expect(titleElement).toBeDefined();

		const dragEnterEvent = new MockDragEvent('dragenter', { bubbles: true, cancelable: true });
		titleElement.dispatchEvent(dragEnterEvent);
		expect(titleElement.classList.contains('dragover')).toBe(true);

		// Should remove 'dragover' (standard behavior check)
		const dragLeaveEvent = new MockDragEvent('dragleave', { bubbles: true, cancelable: true });
		titleElement.dispatchEvent(dragLeaveEvent);
		expect(titleElement.classList.contains('dragover')).toBe(false);

		// Should add 'dragover'
		titleElement.dispatchEvent(dragEnterEvent);
		expect(titleElement.classList.contains('dragover')).toBe(true);

		// Should remove 'dragover' AND RESET THE INTERNAL COUNTER
		const dropEvent = new MockDragEvent('drop', { bubbles: true, cancelable: true });
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: {
				getData: (format: string) =>
				{
					if (format === 'itemID') {return 'source';}
					return '';
				}
			}
		});

		titleElement.dispatchEvent(dropEvent);
		expect(titleElement.classList.contains('dragover')).toBe(false);

		// Simulate Drag Enter AFTER DROP -> Should add 'dragover' AGAIN
		titleElement.dispatchEvent(dragEnterEvent);
		expect(titleElement.classList.contains('dragover')).toBe(true);
	});

	it('should include custom data in drag event when onDragData is provided', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeOnDragData";
		const treeData: TreeData = {
			id: "root",
			children: [
				{
					id: "itemWithData",
					onDragData: () => { return { "customType": "customValue" }; }
				}
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;

		const item = tree.getItem('itemWithData');
		expect(item).toBeDefined();
		const titleElement = item!.querySelector('.ltreeitemtitle') as HTMLElement;
		expect(titleElement).toBeDefined();

		// Mock Drag Start
		const dragStartEvent = new MockDragEvent('dragstart', { bubbles: true, cancelable: true });
		titleElement.dispatchEvent(dragStartEvent);

		const dataTransfer = (dragStartEvent as unknown as { dataTransfer: MockDataTransfer }).dataTransfer;
		expect(dataTransfer.getData("itemID")).toBe("itemWithData");
		expect(dataTransfer.getData("customType")).toBe("customValue");
	});

	it('should prevent drag interactions when skipDrag is set', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeSkipDrag";
		const treeData: TreeData = {
			id: "root",
			children: [
				{
					id: "skipItem",
					skipDrag: true
				}
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;

		const skipItem = tree.getItem('skipItem');
		expect(skipItem).toBeDefined();
		const titleElement = skipItem!.querySelector('.ltreeitemtitle') as HTMLElement;
		expect(titleElement).toBeDefined();

		// Test Drag Enter (should not add dragover class because it returns false, assuming createTreeItem respects it)
		const dragEnterEvent = new MockDragEvent('dragenter', { bubbles: true, cancelable: true });
		titleElement.dispatchEvent(dragEnterEvent);
		expect(titleElement.classList.contains('dragover')).toBe(false);

		// Test Drop (should also return false early)
		const dropEvent = new MockDragEvent('drop', { bubbles: true, cancelable: true });
		titleElement.dispatchEvent(dropEvent);
		expect(titleElement.classList.contains('dragover')).toBe(false);
	});

	it('should prevent move when onMoveItem returns false', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeOnMoveCb";
		const treeData: TreeData = {
			id: "root",
			children: [
				{
					id: "group1",
					children: [ { id: "item1" } ]
				},
				{
					id: "group2",
					children: [ { id: "item2" } ]
				}
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;

		let onMoveCalled = false;
		// Prevent move via callback
		tree.onMoveItem = () =>
		{
			onMoveCalled = true;
			return false;
		};

		const group1 = tree.getItem('group1');
		const item2 = tree.getItem('item2');
		const item2Title = item2!.querySelector('.ltreeitemtitle') as HTMLElement;
		const item2Content = item2Title.querySelector('.incontent') as HTMLElement;

		// Mock Drop item1 onto item2 (should try to move item1 into item2)
		const dropEvent = new MockDragEvent('drop', { bubbles: true, cancelable: true });
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: {
				getData: (format: string) =>
				{
					if (format === 'itemID') { return 'item1'; }
					return '';
				}
			}
		});

		item2Content.dispatchEvent(dropEvent);

		expect(onMoveCalled).toBe(true);
		// Verify hierarchy NOT changed
		expect(tree.getParent('item1')).toBe(group1);
	});

	it('should fire onDropItem callback and item_moved event on successful drop', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeEvents";
		const treeData: TreeData = {
			id: "root",
			children: [
				{
					id: "group1",
					children: [ { id: "source" } ]
				},
				{
					id: "group2",
					children: [ { id: "target" } ]
				}
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;
		const source = tree.getItem('source');
		const target = tree.getItem('target');
		// Const group2 = tree.getItem('group2');
		const targetTitle = target!.querySelector('.ltreeitemtitle') as HTMLElement;
		const targetContent = targetTitle.querySelector('.incontent') as HTMLElement;

		let onDropItemCalled = false;
		tree.onDropItem = (_e, item) =>
		{
			onDropItemCalled = true;
			// Check item is the data of target
			expect(item.id).toBe("target");
		};

		let itemMovedFired = false;
		tree.root.addEventListener("item_moved", (e: Event) =>
		{
			const ce = e as CustomEvent;
			itemMovedFired = true;
			expect(ce.detail.item).toBe(source);
			expect(ce.detail.parent_item).toBe(target); // Moves INTO target
		});

		// Mock Drop
		const dropEvent = new MockDragEvent('drop', { bubbles: true, cancelable: true });
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: {
				getData: (format: string) =>
				{
					if (format === 'itemID') { return 'source'; }
					return '';
				}
			}
		});

		// We need to ensure onMoveItem returns true (default) or is undefined
		targetContent.dispatchEvent(dropEvent);

		expect(onDropItemCalled).toBe(true);
		expect(itemMovedFired).toBe(true);
	});

	it('should fire drop_on_item when dropping external item (no itemID)', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeExternalDrop";
		const treeData: TreeData = {
			id: "root",
			children: [ { id: "node" } ]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;
		const node = tree.getItem('node');
		const nodeTitle = node!.querySelector('.ltreeitemtitle') as HTMLElement;

		let dropOnItemFired = false;
		tree.root.addEventListener("drop_on_item", (e: Event) =>
		{
			const ce = e as CustomEvent;
			dropOnItemFired = true;
			expect(ce.detail.item).toBe(nodeTitle);
		});

		// Mock Drop without itemID
		const dropEvent = new MockDragEvent('drop', { bubbles: true, cancelable: true });
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: {
				getData: () => { return ''; }
			}
		});

		nodeTitle.dispatchEvent(dropEvent);

		expect(dropOnItemFired).toBe(true);
	});

	it('should prevent moving a parent into its own child (Cycle Prevention)', () =>
	{
		const inspector = new Inspector();
		const ObjName = "treeCycle";
		const treeData: TreeData = {
			id: "root",
			children: [
				{
					id: "parent",
					children: [
						{ id: "child" }
					]
				}
			]
		};

		const widget = inspector.addTree(ObjName, treeData, { treeOptions: { allowDrag: true } });
		expect(widget).toBeDefined();
		if (!widget) {return;}
		const tree = widget.tree;
		const child = tree.getItem('child');

		// Attempt to move 'parent' into 'child'
		const result = tree.moveItem('parent', 'child');

		expect(result).toBe(false); // Should fail

		// Verify hierarchy unchanged
		const newParent = tree.getParent('parent');
		expect(newParent).not.toBe(child);
	});
});

describe('Add String Button Test', () =>
{
	it('should create StringButton widget', () =>
	{
		const inspector = new Inspector();
		const name = "StringButton";
		const value = "initial";
		const widget = inspector.addStringButton(name, value, { button: "ClickMe" });
		expect(widget).toBeDefined();
		expect(widget.getValue()).toBe(value);
		const button = widget.querySelector("button");
		expect(button).toBeDefined();
		expect(button!.textContent).toBe("ClickMe");
	});

	it('should trigger callback on button click', () =>
	{
		const inspector = new Inspector();
		const name = "StringButtonCB";
		let clickedValue = "";
		let clicked = false;
		const widget = inspector.addStringButton(name, "test", {
			button: "Action",
			onClick: (val) =>
			{
				clickedValue = val;
				clicked = true;
			}
		});

		const button = widget.querySelector("button");
		button!.click();
		expect(clicked).toBe(true);
		expect(clickedValue).toBe("test");
	});

	it('should handle disabled state', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.addStringButton("Disabled", "val", { disabled: true });
		const input = widget.querySelector("input") as HTMLInputElement;
		const button = widget.querySelector("button") as HTMLButtonElement;

		expect(input.disabled).toBe(true);

		// Validate disable/enable methods
		widget.enable();
		expect(input.disabled).toBe(false);
		expect(button.disabled).toBe(false);

		widget.disable();
		expect(input.disabled).toBe(true);
		expect(button.disabled).toBe(true);
	});

	it('should set icon correctly', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.addStringButton("IconTest", "val", { button: "MyButton" });
		const button = widget.querySelector("button") as HTMLButtonElement;

		widget.setIcon("test.png");
		const styleInfo = button.getAttribute('style');
		expect(styleInfo).toContain("test.png");
		expect(button.innerHTML).toBe(""); // Text should be removed
		expect(button.style.backgroundSize).toBe("contain");

		widget.setIcon("");
		expect(button.innerHTML).toBe("MyButton"); // Text should be restored
		expect(button.style.backgroundImage).toBe("");
	});

	it('should get and set value', () =>
	{
		const inspector = new Inspector();
		const name = "ValueTest";
		const widget = inspector.addStringButton(name, "initial");
		const input = widget.querySelector("input") as HTMLInputElement;

		// GetValue
		expect(widget.getValue()).toBe("initial");
		expect(inspector.getValue(name)).toBe("initial");

		// SetValue
		widget.setValue("updated");
		expect(input.value).toBe("updated");
		expect(widget.getValue()).toBe("updated");
		expect(inspector.getValue(name)).toBe("updated");
	});
});

describe('Inspector Widget Registration Test', () =>
{
	// Define a custom widget function (mock implementation)
	const customWidgetName = "customWidget";
	const customWidgetFunc = function (this: Inspector, name?: string, value?: InspectorValue, options?: CreateWidgetOptions): InspectorWidget
	{
		const element = this.createWidget(name, "Custom Content", options);
		return element;
	};

	it('should register a new widget using a function', () =>
	{
		Inspector.registerWidget(customWidgetName, customWidgetFunc);
		expect(Inspector.widgetConstructors[customWidgetName.toLowerCase()]).toBe(customWidgetFunc);
	});

	it('should be able to add the registered widget', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.add(customWidgetName, "My Custom Widget", "some value");
		expect(widget).toBeDefined();
		expect(widget?.innerHTML).toContain("Custom Content");
	});

	it('should unregister the widget', () =>
	{
		Inspector.unregisterWidget(customWidgetName);
		expect(Inspector.widgetConstructors[customWidgetName.toLowerCase()]).toBeUndefined();
	});

	it('should not be able to add the unregistered widget', () =>
	{
		const inspector = new Inspector();
		// Suppress console.warn for this test as we expect a warning
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

		const widget = inspector.add(customWidgetName, "My Custom Widget", "some value");

		expect(warnSpy).toHaveBeenCalled();
		expect(widget).toBeUndefined();

		warnSpy.mockRestore();
	});

	it('should register a widget using a method name (string)', () =>
	{
		const methodName = "addString"; // Using an existing method for testing
		const aliasName = "myStringAlias";
		Inspector.registerWidget(aliasName, methodName);
		expect(Inspector.widgetConstructors[aliasName.toLowerCase()]).toBe(methodName);

		const inspector = new Inspector();
		// DEBUG: Verify addString exists
		if ("addString" in inspector && typeof inspector.addString !== 'function')
		{
			console.error("Inspector instance does NOT have addString method!");
		}
		expect(inspector.addString).toBeDefined();

		const widget = inspector.add(aliasName, "Aliased String", "test");
		expect(widget).toBeDefined();
		// Clean up
		Inspector.unregisterWidget(aliasName);
	});
});

describe('Combo Edge Cases', () =>
{
	it('should handle empty values array', () =>
	{
		const inspector = new Inspector();
		const combo = inspector.addCombo("emptyCombo", "", { values: [] });
		expect(combo.getValue()).toBe("");
		const options = combo.querySelectorAll("select option");
		expect(options.length).toBe(0);
	});

	it('should handle single item selection', () =>
	{
		const inspector = new Inspector();
		const combo = inspector.addCombo("singleCombo", "only", { values: ["only"] });
		expect(combo.getValue()).toBe("only");
		const options = combo.querySelectorAll("select option");
		expect(options.length).toBe(1);
	});

	it('should round-trip setValue and getValue', () =>
	{
		const inspector = new Inspector();
		const values = ["alpha", "beta", "gamma"];
		const combo = inspector.addCombo("roundTrip", "alpha", { values });

		combo.setValue("gamma");

		expect(combo.getValue()).toBe("gamma");

		const select = combo.querySelector("select") as HTMLSelectElement;
		expect(select.selectedIndex).toBe(2);
		expect(select.options[select.selectedIndex].textContent).toBe("gamma");
	});

	it('should dynamically update options with setOptionValues', () =>
	{
		const inspector = new Inspector();
		const combo = inspector.addCombo("dynamicCombo", "a", { values: ["a", "b"] });

		combo.setOptionValues(["x", "y", "z"], "y");

		const options = combo.querySelectorAll("select option");
		expect(options.length).toBe(3);
		expect(combo.getValue()).toBe("y");
	});

	it('should execute callback on select change', () =>
	{
		const callback = jest.fn();
		const inspector = new Inspector();
		const values = ["one", "two", "three"];
		const combo = inspector.addCombo("callbackCombo", "one", { values, callback });

		const select = combo.querySelector("select") as HTMLSelectElement;
		expect(select).not.toBeNull();

		select.value = "1";
		select.dispatchEvent(new Event("change", { bubbles: true }));

		expect(callback).toHaveBeenCalled();
	});
});

describe('Inspector Empty Value Handling', () =>
{
	it('should default addString with undefined value to empty string', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.addString("emptyStr", undefined);
		expect(widget.getValue()).toBe("");
	});

	it('should default addNumber with undefined value to 0', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.addNumber("emptyNum", undefined);
		expect(widget.getValue()).toBe(0);
	});

	it('should return undefined for non-existent widget name', () =>
	{
		const inspector = new Inspector();
		inspector.addString("exists", "hello");
		expect(inspector.getValue("nonExistent")).toBeUndefined();
	});

	it('should not throw when setValues is called with empty object', () =>
	{
		const inspector = new Inspector();
		inspector.addString("s1", "val");
		expect(() => inspector.setValues({})).not.toThrow();
		expect(inspector.getValue("s1")).toBe("val");
	});

	it('should return empty map from getValues on inspector with no widgets', () =>
	{
		const inspector = new Inspector();
		const values = inspector.getValues();
		expect(values.size).toBe(0);
	});
});

describe('Inspector Unicode Input Handling', () =>
{
	it('should round-trip unicode string values', () =>
	{
		const inspector = new Inspector();
		const testStrings = ["日本語テスト", "Ñoño", "🎉🚀", "Ω≈ç√∫"];
		for (const str of testStrings)
		{
			const name = `unicode_${str.slice(0, 3)}`;
			const widget = inspector.addString(name, str);
			expect(widget.getValue()).toBe(str);

			widget.setValue("changed");
			expect(widget.getValue()).toBe("changed");

			widget.setValue(str);
			expect(widget.getValue()).toBe(str);
		}
	});

	it('should store unicode info values correctly', () =>
	{
		const inspector = new Inspector();
		const unicodeInfo = "这是中文信息 αβγδ";
		inspector.addInfo("infoUnicode", unicodeInfo);
		expect(inspector.getValue("infoUnicode")).toBe(unicodeInfo);
	});

	it('should handle unicode combo option values', () =>
	{
		const inspector = new Inspector();
		const values = ["café", "naïve", "über"];
		const combo = inspector.addCombo("unicodeCombo", "café", { values });
		expect(combo.getValue()).toBe("café");

		combo.setValue("über");
		expect(combo.getValue()).toBe("über");
	});
});

describe('Inspector Widget Disable/Enable Transitions', () =>
{
	it('should disable and enable string widget', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.addString("disableStr", "test");
		const input = widget.querySelector("input") as HTMLInputElement;

		widget.disable();
		expect(input.disabled).toBe(true);

		widget.enable();
		expect(input.disabled).toBe(false);
	});

	it('should preserve number value through disable/enable cycle', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.addNumber("disableNum", 42);

		widget.disable();
		const input = widget.querySelector("input") as HTMLInputElement;
		expect(input.disabled).toBe(true);

		widget.enable();
		expect(input.disabled).toBe(false);
		expect(widget.getValue()).toBe(42);
	});

	it('should handle multiple disable/enable cycles on string widget', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.addString("multiToggle", "val");
		const input = widget.querySelector("input") as HTMLInputElement;

		for (let i = 0; i < 3; i++)
		{
			widget.disable();
			expect(input.disabled).toBe(true);
			widget.enable();
			expect(input.disabled).toBe(false);
		}
	});

	it('should disable both input and button on StringButton widget', () =>
	{
		const inspector = new Inspector();
		const widget = inspector.addStringButton("disableSB", "val", { button: "Go" });
		const input = widget.querySelector("input") as HTMLInputElement;
		const button = widget.querySelector("button") as HTMLButtonElement;

		widget.disable();
		expect(input.disabled).toBe(true);
		expect(button.disabled).toBe(true);

		widget.enable();
		expect(input.disabled).toBe(false);
		expect(button.disabled).toBe(false);
	});
});

describe('Tab Index Management', () =>
{
	it('should increment tabIndex with each addString call', () =>
	{
		const inspector = new Inspector();
		const initialTab = inspector.tabIndex;

		inspector.addString("tab1", "a");
		expect(inspector.tabIndex).toBe(initialTab + 1);

		inspector.addString("tab2", "b");
		expect(inspector.tabIndex).toBe(initialTab + 2);

		inspector.addString("tab3", "c");
		expect(inspector.tabIndex).toBe(initialTab + 3);
	});

	it('should set tabIndex attribute on input elements', () =>
	{
		const inspector = new Inspector();
		const baseTab = inspector.tabIndex;

		const w1 = inspector.addString("tabInput1", "x");
		const input1 = w1.querySelector("input") as HTMLInputElement;
		expect(input1.tabIndex).toBe(baseTab);

		const w2 = inspector.addString("tabInput2", "y");
		const input2 = w2.querySelector("input") as HTMLInputElement;
		expect(input2.tabIndex).toBe(baseTab + 1);
	});

	it('should increment tabIndex with addNumber calls', () =>
	{
		const inspector = new Inspector();
		const initialTab = inspector.tabIndex;

		inspector.addNumber("numTab1", 1);
		expect(inspector.tabIndex).toBe(initialTab + 1);

		inspector.addNumber("numTab2", 2);
		expect(inspector.tabIndex).toBe(initialTab + 2);
	});
});

describe('Serialization / Deserialization of Complex Widgets', () =>
{
	it('should round-trip string array via addArray setValue/getValue', () =>
	{
		const inspector = new Inspector();
		const initial = ["alpha", "beta", "gamma"];
		const widget = inspector.addArray("strArr", initial);

		expect(widget.getValue()).toEqual(initial);

		const updated = ["x", "y", "z"];
		widget.setValue(updated);
		expect(widget.getValue()).toEqual(updated);
	});

	it('should round-trip number array via addArray setValue/getValue', () =>
	{
		const inspector = new Inspector();
		const initial = [1, 2, 3];
		const widget = inspector.addArray("numArr", initial, { dataType: "number" });

		expect(widget.getValue()).toEqual(initial);

		const updated = [10, 20, 30];
		widget.setValue(updated);
		expect(widget.getValue()).toEqual(updated);
	});

	it('should update tree via setValue with new TreeData', () =>
	{
		const inspector = new Inspector();
		const initial: TreeData = { id: "root", children: [{ id: "a" }] };
		const widget = inspector.addTree("serTree", initial);
		expect(widget).toBeDefined();
		if (!widget) { return; }

		const tree = widget.tree;
		expect(tree.getItem("a")).toBeDefined();

		const updated: TreeData = { id: "root", children: [{ id: "b" }, { id: "c" }] };
		widget.setValue!(updated);

		expect(tree.getItem("b")).toBeDefined();
		expect(tree.getItem("c")).toBeDefined();
	});

	it('should render nested data tree nodes correctly', () =>
	{
		const inspector = new Inspector();
		const data: TreeData = {
			name: "Test",
			nested: {
				key: "value"
			}
		};
		const widget = inspector.addDataTree("dataTreeSer", data);
		expect(widget).toBeDefined();
		if (!widget) { return; }

		const nodes = widget.querySelectorAll(".treenode");
		expect(nodes.length).toBeGreaterThan(0);

		const itemNames = widget.querySelectorAll(".itemname");
		const names = Array.from(itemNames).map(el => el.textContent);
		expect(names).toContain("name");
		expect(names).toContain("nested");
		expect(names).toContain("key");
	});

	it('should add and remove items via array widget buttons', () =>
	{
		const inspector = new Inspector();
		const initial = ["one"];
		const widget = inspector.addArray("btnArr", initial);

		expect(widget.getValue()).toEqual(["one"]);

		// Click + button to add
		const el = widget as unknown as HTMLElement;
		const plusBtn = el.querySelector(".array-controls .litebutton") as HTMLButtonElement;
		expect(plusBtn).toBeDefined();
		plusBtn.click();

		expect(widget.getValue().length).toBe(2);

		// Click - button to remove
		const buttons = el.querySelectorAll(".array-controls .litebutton");
		const minusBtn = buttons[1] as HTMLButtonElement;
		minusBtn.click();

		expect(widget.getValue().length).toBe(1);
	});
});

describe('Inspector setValues / getValues Round-Trip', () =>
{
	it('should round-trip multiple widget values via setValues/getValues', () =>
	{
		const inspector = new Inspector();
		inspector.addString("name", "initial");
		inspector.addNumber("age", 0);

		inspector.setValues({ name: "Alice", age: 30 });

		expect(inspector.getValue("name")).toBe("Alice");
		expect(inspector.getValue("age")).toBe("30");
	});

	it('should fire onChange callback when widget value changes', () =>
	{
		const onChangeFn = jest.fn();
		const inspector = new Inspector({ onChange: onChangeFn });
		inspector.addString("changeTest", "old");

		const widget = inspector.getWidget("changeTest");
		expect(widget).toBeDefined();

		// Trigger change via input event
		const input = widget!.querySelector("input") as HTMLInputElement;
		input.value = "new";
		input.dispatchEvent(new Event("change", { bubbles: true }));

		expect(onChangeFn).toHaveBeenCalled();
		expect(onChangeFn).toHaveBeenCalledWith("changeTest", "new", widget);
	});
});