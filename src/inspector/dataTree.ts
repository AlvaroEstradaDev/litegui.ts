import { TreeData } from "../widgets/tree";
import { CreateWidgetOptions } from "../@types/Inspector";
import { Inspector } from "./inspector";
import { InspectorTreeWidget } from "./tree";

/**
 * Adds a tree widget to the inspector using arrays of strings as their tree data.
 * @function AddDataTree
 * @param {Inspector} that - The reference to the inspector.
 * @param {string} name - The name of the tree widget.
 * @param {TreeData} value - The tree data object to display.
 * @param {CreateWidgetOptions} [options] - Configuration options for the widget.
 * @returns {InspectorTreeWidget} The created tree widget instance.
 */
export function AddDataTree(that: Inspector, name: string, value: TreeData, options?: CreateWidgetOptions)
{
	// Create the widget structure
	const element = that.createWidget(name, "<div class='wtree'></div>", options) as InspectorTreeWidget;

	const treeRoot: HTMLDivElement | null = element.querySelector(".wtree");
	if (!treeRoot) { return; }

	// Recursively build the tree nodes
	_Recursive(treeRoot, value);

	// Apply height and overflow styles if specified
	if (options && options.height)
	{
		treeRoot.style.height = typeof (options.height) == "number" ? options.height + "px" : options.height;
		treeRoot.style.overflow = "auto";
	}

	/**
	 * Recursively builds the DOM structure for the tree data.
	 * @function innerRecursive
	 * @param {HTMLDivElement} rootNode - The parent DOM element to append nodes to.
	 * @param {TreeData} data - The current level of tree data to process.
	 */
	function _Recursive(rootNode: HTMLDivElement, data: TreeData)
	{
		for (const i in data)
		{
			// Create container for the tree node
			const e = document.createElement("div");
			e.className = "treenode";
			const value = data[i];

			// Handle object values (nested nodes)
			if (typeof value == "object" && !Array.isArray(value))
			{
				e.innerHTML = `<span class='itemname'>${i}</span><span class='itemcontent'></span>`;
				const content: HTMLDivElement | null = e.querySelector(".itemcontent");
				if (content == null) { throw new Error("TreeNode wasn't properly created"); }
				_Recursive(content, value as TreeData);
			}
			// Handle primitive values (leaf nodes)
			else
			{
				e.innerHTML = `<span class='itemname'>${i}</span><span class='itemvalue'>${value}</span>`;
			}
			rootNode.appendChild(e);
		}
	}

	that.appendWidget(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addDataTree(name: string, value: TreeData, options?: CreateWidgetOptions): InspectorTreeWidget | undefined;
	}
}

Inspector.prototype.addDataTree = function (name: string, value: TreeData, options?: CreateWidgetOptions): InspectorTreeWidget | undefined
{
	return AddDataTree(this, name, value, options);
};

Inspector.widgetConstructors.datatable = "addDataTree";