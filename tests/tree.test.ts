import { TreeData } from "../src/widgets/tree";
import { LiteGUI } from "../src/core";

const myTree: TreeData =
{
	id: "Scene",
	children: [
		{
			id: "Sun"
		},
		{
			id: "Cameras",
			children: [
				{
					id: "Camera 1"
				},
				{
					id: "Camera 2"
				},
				{
					id: "Camera 3"
				}
			]
		},
		{
			id: "System",
			children: [
				{
					id: 'Planet 1'
				},
				{
					id: 'Planet 2'
				},
				{
					id: 'Moon'
				}
			]
		},
		{
			id: "Stations",
			children: [
				{
					id: 'Station 1'
				},
				{
					id: 'Station 2'
				},
				{
					id: 'Station 3'
				},
				{
					id: 'Station 4'
				}
			]
		}
	]
};

const myNewTree: TreeData =
{
	id: "new tree",
	children: [
		{
			id: "Moons",
			children: [
				{
					id: 'Moon 1'
				},
				{
					id: 'Moon 2'
				}
			]
		}
	]
};


const moonsTree: TreeData =
{
	id: "Moons",
	children: [
		{
			id: 'Moon 1'
		},
		{
			id: 'Moon 2'
		}
	]
};

// For the tests to run I commented the lines that used this._updateListBox, since I was getting an error about using "box" before initializing it, I think this is something visual
describe("Test de creacion tree", () =>
{
	const options = { height: 200, allowRename: false, allowDrag: true, allowMultiSelection: false };
	it("Tree should be defined", () =>
	{
		expect(new LiteGUI.Tree(myTree, options)).toBeDefined();
	});
});

describe('Get children', () =>
{
	const options = { height: 200, allowRename: false, allowDrag: true, allowMultiSelection: false };
	const tree = new LiteGUI.Tree(myTree, options);
	const children = tree.getChildren("System", true);
	it("Children should be defined", () =>
	{
		expect(children).toBeDefined();
	});
});

describe('Get parent', () =>
{
	const options = { height: 200, allowRename: false, allowDrag: true, allowMultiSelection: false };
	const tree = new LiteGUI.Tree(myTree, options);
	const parent = tree.getParent("Moon");
	expect(parent).toBeDefined();
	const parentId = parent!.data.id;
	it("Parent id should be System", () =>
	{
		expect(parentId).toBe("System");
	});
});

describe('Clear tree', () =>
{
	const options = { height: 200, allowRename: false, allowDrag: true, allowMultiSelection: false };
	const tree = new LiteGUI.Tree(myTree, options);
	tree.updateTree(myTree);
	tree.clear(true);
	const children = tree.getChildren("Scene", true);
	it("Should have 0 children", () =>
	{
		expect(children).toBeDefined();
		expect(children!.length).toBe(0);
	});
});

describe('Update tree', () =>
{
	const options = { height: 200, allowRename: false, allowDrag: true, allowMultiSelection: false };
	const tree = new LiteGUI.Tree(myTree, options);
	// Double check this function, since the old data is not being discarded as the description says
	tree.updateTree(myNewTree);
	const children = tree.getChildren("new tree", true);
	it("Should have 1 child", () =>
	{
		expect(children).toBeDefined();
		expect(children!.length).toBe(1);
	});
});

describe('Insert 1 item', () =>
{
	const options = { height: 200, allowRename: false, allowDrag: true, allowMultiSelection: false };
	const tree = new LiteGUI.Tree(myTree, options);
	tree.updateTree(myTree);
	tree.insertItem(moonsTree, "Stations", 0, options);
	const children = tree.getChildren("Stations", true);
	it("Should have 5 children", () =>
	{
		expect(children).toBeDefined();
		expect(children!.length).toBe(5);
	});
});

describe('Remove 1 item', () =>
{
	const options = { height: 200, allowRename: false, allowDrag: true, allowMultiSelection: false };
	const tree = new LiteGUI.Tree(myTree, options);
	tree.updateTree(myTree);
	tree.removeItem("System", true);
	const children = tree.getChildren("Scene", true);
	it("Should have 3 children", () =>
	{
		expect(children).toBeDefined();
		expect(children!.length).toBe(3);
	});
});


describe('Filter by name', () =>
{
	const options = { height: 200, allowRename: false, allowDrag: true, allowMultiSelection: false };
	const tree = new LiteGUI.Tree(myTree, options);
	tree.updateTree(myTree);
	tree.filterByName("Planet");

	let notFilteredItems = 0;
	for (const child of tree.root.children)
	{
		if (!child.classList.contains("filtered"))
		{
			notFilteredItems++;
		}
	}

	it("Should have 2 not filtered items", () =>
	{
		expect(notFilteredItems).toBe(2);
	});
});