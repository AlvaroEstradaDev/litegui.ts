import type { Tree, TreeData, TreeNode, TreeOptions } from "../widgets/tree";
import { CreateWidgetOptions, InspectorValue, InspectorWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "./inspector";

/**
 * Options for creating a Tree widget.
 */
export interface addTreeOptions extends CreateWidgetOptions
{
	/**
	 * Options passed to the underlying Tree widget.
	 */
	treeOptions?: TreeOptions;
	/**
	 * Callback function triggered when a tree node is selected.
	 */
	callback?: (node: TreeNode, data: TreeData) => void;
}

/**
 * Interface representing the Inspector Tree widget.
 */
export interface InspectorTreeWidget extends InspectorWidget
{
	/**
	 * Reference to the internal Tree instance.
	 */
	tree: Tree;
}

/**
 * Adds a tree widget to the inspector.
 * @function AddTree
 * @param {Inspector} that The inspector instance.
 * @param {string} name - The name of the tree widget.
 * @param {TreeData} value The tree data to display.
 * @param {addTreeOptions} [options] Configuration options.
 * @returns {InspectorTreeWidget} The created tree widget instance.
 */
export function AddTree(that: Inspector, name: string, value: TreeData, options: addTreeOptions = {})
{
	const element = that.createWidget(name, "<div class='wtree inputfield full'></div>", options) as InspectorTreeWidget;

	const treeRoot: HTMLDivElement | null = element.querySelector(".wtree");
	if (!treeRoot) { return; }

	if (options.height)
	{
		treeRoot.style.height = typeof (options.height) == "number" ? options.height + "px" : options.height;
		treeRoot.style.overflow = "auto";
	}

	const tree = element.tree = new LiteGUI.Tree(value, options.treeOptions);
	tree.onItemSelected = function (data: TreeData, node: TreeNode)
	{
		if (options.callback) { options.callback.call(element, node, data); }
	};

	treeRoot.appendChild(tree.root);

	element.setValue = function (v: InspectorValue)
	{
		if (v && typeof v === 'object' && !Array.isArray(v))
		{
			tree.updateTree(v as TreeData);
		}
	};

	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addTree(name: string, value: TreeData, options?: addTreeOptions): InspectorTreeWidget | undefined;
	}
}

Inspector.prototype.addTree = function (name: string, value: TreeData, options?: addTreeOptions): InspectorTreeWidget | undefined
{
	return AddTree(this, name, value, options);
};

Inspector.widgetConstructors.tree = "addTree";