
import { Trigger } from "../utilities";
import { ListBox, ListBoxSpanElement } from ".";
import { LiteGUIObject } from "../@types/globals";

/**
 * EventTarget extending interface for Tree related events.
 */
export interface TreeEventTarget extends EventTarget
{
	parentNode: TreeNode;
}

/**
 * Configuration options for the Tree widget.
 */
export interface TreeOptions
{
	allowDrag?: boolean;
	allowRename?: boolean;
	allowMultiSelection?: boolean;
	selected?: boolean;
	collapsed?: boolean;
	collapsed_depth?: number;
	indentOffset?: number;
	id?: string;
	height?: string | number;
}

/**
 * HTMLDivElement extending interface for the title element of a tree node.
 */
export interface TreeTitleElement extends HTMLDivElement
{
	oldName?: string;
	isEditing?: boolean;
}

export interface TreeCollection extends HTMLCollection
{
	[index: number]: TreeNode
}

/**
 * HTMLLIElement extending interface for a tree node.
 */
export interface TreeNode extends HTMLLIElement
{
	id: string;
	data: TreeData;
	parentId: string;
	listBox?: ListBoxSpanElement;
	titleElement: TreeTitleElement;
	dataset: {
		itemID: string;
		[index: string]: string };
	childNodes: NodeListOf<TreeNode>;
	children: TreeCollection;
	content?: string;
	skipDrag?: boolean;
	onDragData?: () => Record<string, string>;
	callback?: (node?: TreeNode) => boolean;
	visible?: boolean;
	postContent?: string;
	preContent?: string;
	parentNode: TreeNode | ParentNode | null;
}

/**
 * Data structure representing a tree node's data.
 */
export interface TreeData
{
	children?: TreeData[];
	onDragData?: () => Record<string, string>;
	skipDrag?: boolean;
	[index: string]: string | number | boolean | TreeData | TreeData[] | ((...args: unknown[]) => unknown) | Record<string, unknown> | undefined;
}

/**
 * Root element for the Tree widget.
 */
export interface TreeRoot extends HTMLDivElement
{
	childNodes: NodeListOf<TreeNode>;
	children: TreeCollection;
}

/**
 * Widget to create interactive trees (useful for folders or hierarchies).
 * @class Tree
 */
export class Tree implements LiteGUIObject
{
	root: TreeRoot;
	tree: TreeData;
	options: TreeOptions;
	rootItem?: TreeNode;
	parentNode?: ParentNode;
	indentOffset: number;
	collapsedDepth: number;
	onItemSelected?: (data: TreeData, node: TreeNode) => void;
	onItemContextMenu?: (event: PointerEvent, { item, data }: { item: TreeNode, data: TreeData }) => void;
	onBackgroundClicked?: (event: PointerEvent, tree: Tree) => void;
	onContextMenu?: (event: PointerEvent) => void;
	onItemAddToSelection?: (data: TreeData, node: TreeNode) => void;
	onMoveItem?: (item?: TreeNode, parent?: TreeNode) => boolean;
	onDropItem?: (event: DragEvent, data: TreeData) => void;

	protected _skipScroll: boolean = false;

	static INDENT = 20;

	/**
	 * Creates an instance of the Tree widget.
	 * @param {TreeData} data - The data to initialize the tree with.
	 * @param {TreeOptions} [options] - Configuration options.
	 */
	constructor(data: TreeData, options?: TreeOptions)
	{
		options = options ?? {};

		const root = document.createElement("div") as TreeRoot;
		this.root = root;
		if (options.id) { root.id = options.id; }

		root.className = "litetree";
		this.tree = data;
		options = options ?? { allowRename: false, allowDrag: true, allowMultiSelection: false };
		this.options = options;
		this.indentOffset = options.indentOffset || 0;

		if (options.height)
		{
			this.root.style.height = typeof (options.height) == "string" ? options.height : Math.round(options.height) + "px";
		}

		this.collapsedDepth = 3;
		if (options.collapsed_depth != null) { this.collapsedDepth = options.collapsed_depth; }

		// Bg click
		root.addEventListener("click", (e) =>
		{
			if (e.target != this.root) { return; }
			if (this.onBackgroundClicked) { this.onBackgroundClicked(e, this); }
		});

		// Bg click right mouse
		root.addEventListener("contextmenu", (e: PointerEvent) =>
		{
			if (e.button != 2) { return false; } // Right button

			if (this.onContextMenu) { this.onContextMenu(e); }
			e.preventDefault();
			return false;
		});


		const rootItem = this.createAndInsert(data, options);
		if (!rootItem)
		{
			throw ("Error in LiteGUI.Tree, createAndInsert returned null");
		}
		rootItem.className += " root_item";
		this.rootItem = rootItem;

	}

	/**
	 * Update tree with new data (old data will be thrown away).
	 * @param {TreeData} data - New data to display references.
	 */
	updateTree(data: TreeData)
	{
		this.root.innerHTML = "";
		const rootItem = this.createAndInsert(data, this.options);
		if (rootItem)
		{
			rootItem.className += " root_item";
			this.rootItem = rootItem;
		}
		else
		{
			this.rootItem = undefined;
		}
	}

	/**
	 * Inserts an item into the tree.
	 * @param {TreeData | TreeNode} data - Data to create the item from.
	 * @param {string} [parentID] - ID of the parent item.
	 * @param {number} [position] - Index in case you want to add it before the last position.
	 * @param {TreeOptions} [options] - Options for the item.
	 * @returns {TreeNode | undefined} The created item.
	 */
	insertItem(data: TreeData | TreeNode, parentID: string | undefined, position: number, options: TreeOptions = {}): TreeNode | undefined
	{
		if (!parentID)
		{
			const root = this.root.childNodes[0];
			if (root)
			{
				parentID = root.dataset.itemID;
			}
		}

		const element = this.createAndInsert(data, options, parentID, position);

		// Update parent collapse button
		if (parentID)
		{
			const r = this._findElement(parentID);
			if (r)
			{
				this._updateListBox(r); // No options here, this is the parent
			}
		}

		return element;
	}

	/**
	 * Creates and inserts an item.
	 * @param {TreeData | TreeNode} data - Data for the item.
	 * @param {TreeOptions} options - Options for the tree.
	 * @param {string} [parentID] - Parent ID.
	 * @param {number} [elementIndex] - Index to insert at.
	 * @returns {TreeNode | undefined} The created node.
	 */
	createAndInsert(data: TreeData | TreeNode, options: TreeOptions, parentID?: string, elementIndex?: number): TreeNode | undefined
	{
		// Find parent
		let parentIndex = -1; // Root
		if (typeof parentID === "string")
		{
			parentIndex = this._findElementIndex(parentID);
		}

		let parent: TreeNode | undefined = undefined;
		let childLevel = 0;

		// Find level
		if (parentIndex != -1)
		{
			parent = this.root.childNodes[parentIndex];
			childLevel = parseInt(parent.dataset.level ?? "0") + 1;
		}

		// Create
		const element = this.createTreeItem(data, options, childLevel.toString());
		if (!element) { return; } // Error creating element

		element.parentId = parentID ?? "0";

		// Check
		const existingItem = this.getItem(element.dataset.itemID as string);
		if (existingItem) { console.warn("There another item with the same ID in this tree"); }

		// Insert
		if (parentIndex == -1)
		{
			this.root.appendChild(element);
		}
		else
		{
			this._insertInside(element, parentIndex, elementIndex);
		}

		// Compute visibility according to parents
		if (parent && parentID && !this._isNodeChildrenVisible(parentID))
		{
			element.classList.add("hidden");
		}

		// Children
		if ("children" in data && Array.isArray(data.children))
		{
			for (const child of data.children)
			{
				if ("id" in child)
				{
					this.createAndInsert(child, options, element.dataset.itemID);
				}
			}
		}

		// Update collapse button
		this._updateListBox(element, options, childLevel);

		if (options && options.selected)
		{
			this._markAsSelected(element, true);
		}

		return element;
	}

	/**
	 * Inserts a node inside another node (parent).
	 * @private
	 * @param {TreeNode} element - The node to insert.
	 * @param {number} parentIndex - The index of the parent node.
	 * @param {number} [offsetIndex] - Optional offset index.
	 * @param {number} [level] - Optional level.
	 */
	private _insertInside(element: TreeNode, parentIndex: number, offsetIndex?: number, level?: number)
	{
		const parent = this.root.childNodes[parentIndex];
		if (!parent)
		{
			throw (`No parent node found, index: ${parentIndex}, nodes: ${this.root.childNodes.length}`);
		}

		const parentLevel = parseInt(parent.dataset.level ?? "0");
		const childLevel = level !== undefined ? level : parentLevel + 1;

		const indent = element.querySelector(".indentblock") as HTMLSpanElement;
		if (indent)
		{
			indent.style.paddingLeft = ((childLevel + this.indentOffset) * Tree.INDENT) + "px"; // Inner padding
		}
		element.dataset.level = childLevel.toString();

		// Update level class
		const classes = Array.from(element.classList);
		for (const cls of classes)
		{
			if (cls.startsWith("ltree-level-"))
			{
				element.classList.remove(cls);
			}
		}
		element.classList.add("ltree-level-" + childLevel);

		// Under level nodes
		for (let j = parentIndex + 1; j < this.root.childNodes.length; ++j)
		{
			const newChildNode = this.root.childNodes[j];
			if (!newChildNode.classList || !newChildNode.classList.contains("ltreeitem"))
			{
				continue;
			}
			const currentLevel = parseInt(newChildNode.dataset.level ?? "");

			if (currentLevel == childLevel && offsetIndex)
			{
				offsetIndex--;
				continue;
			}

			// Last position
			if (currentLevel < childLevel || (offsetIndex === 0 && currentLevel === childLevel))
			{
				this.root.insertBefore(element, newChildNode);
				return;
			}
		}

		// Ended
		this.root.appendChild(element);
	}

	/**
	 * Creates a tree item HTML element.
	 * @param {TreeData | TreeNode} data - Data for the item.
	 * @param {TreeOptions} options - Options.
	 * @param {string} level - Level of indentation.
	 * @returns {TreeNode | undefined} The created tree node.
	 */
	createTreeItem(data: TreeData | TreeNode, options: TreeOptions, level: string): TreeNode | undefined
	{
		if (!data)
		{
			console.error("Tree item cannot be null");
			return;
		}

		const isHTMLElement = data instanceof HTMLElement;

		options = options ?? this.options;

		const root = document.createElement("li") as TreeNode;
		root.className = "ltreeitem";

		// IDs are not used because they could collide, classes instead
		if ("id" in data && typeof data.id === "string")
		{
			const safeID = data.id.replace(/\s/g, "_");
			root.className += ` ltreeitem-${safeID}`;
			root.dataset.itemID = data.id;
		}

		if ("dataset" in data && typeof data.dataset === "object")
		{
			for (const i in data.dataset)
			{
				const dataset = data.dataset as Record<string, string>;
				if (typeof dataset[i] === "string")
				{
					root.dataset[i] = dataset[i];
				}
			}
		}

		if (isHTMLElement && data.data)
		{
			root.data = data.data;
		}
		else
		{
			root.data = data as TreeData;
		}

		if (level !== undefined)
		{
			root.dataset.level = level;
			root.classList.add("ltree-level-" + level);
		}

		const titleElement = document.createElement("div");
		titleElement.className = "ltreeitemtitle";
		if ("className" in data && typeof data.className === "string")
		{
			titleElement.className += ` ${data.className}`;
		}

		titleElement.innerHTML = "<span class='precontent'></span><span class='indentblock'></span><span class='collapsebox'></span><span class='incontent'></span><span class='postcontent'></span>";

		const content_text = ("content" in data ? data.content : ("id" in data ? data.id : "")) as string;
		const inContent = titleElement.querySelector(".incontent") as HTMLSpanElement;
		if (inContent)
		{
			inContent.innerHTML = content_text;
		}

		if ("preContent" in data && typeof data.preContent === "string")
		{
			const preContent = titleElement.querySelector(".precontent");
			if (preContent)
			{
				preContent.innerHTML = data.preContent;
			}
		}

		if ("postContent" in data && typeof data.postContent === "string")
		{
			const postContent = titleElement.querySelector(".postcontent");
			if (postContent)
			{
				postContent.innerHTML = data.postContent;
			}
		}

		root.appendChild(titleElement);
		root.titleElement = titleElement;

		if ("visible" in data && data.visible === false)
		{
			root.style.display = "none";
		}

		const row = root;
		const onNodeSelected = (e: PointerEvent) =>
		{
			e.preventDefault();
			e.stopPropagation();

			const node = row;
			const title = node.titleElement;

			if (title?.isEditing) { return; }

			if (e.ctrlKey && this.options.allowMultiSelection)
			{
				// Check if selected
				if (this._isNodeSelected(node))
				{
					node.classList.remove("selected");
					Trigger(this.root, "item_remove_from_selection", { item: node, data: node.data }); // LEGACY
					return;
				}

				// Mark as selected
				this._markAsSelected(node, true);
				Trigger(this.root, "item_add_to_selection", { item: node, data: node.data }); // LEGACY
				let r = false;
				if (isHTMLElement && data.callback)
				{
					r = data.callback.call(this, node);
				}

				if (!r && this.onItemAddToSelection)
				{
					this.onItemAddToSelection(node.data, node);
				}
			}
			if (e.shiftKey && this.options.allowMultiSelection)
			{
				// Select from current selection till here current
				const last_item = this.getSelectedItem();
				if (!last_item) { return; }

				if (last_item === node) { return; }

				const nodeList = Array.prototype.slice.call(last_item.parentNode!.children);
				const last_index = nodeList.indexOf(last_item);
				const current_index = nodeList.indexOf(node);

				const items = current_index > last_index ? nodeList.slice(last_index, current_index) : nodeList.slice(current_index, last_index);
				for (let i = 0; i < items.length; ++i)
				{
					const item = items[i];
					// Mark as selected
					this._markAsSelected(item, true);
					Trigger(this.root, "item_add_to_selection", { item: item, data: item.data }); // LEGACY
				}
			}
			else
			{
				// Mark as selected
				this._markAsSelected(node);

				this._skipScroll = true; // Avoid scrolling while user clicks something
				Trigger(this.root, "item_selected", { item: node, data: node.data }); // LEGACY
				let r = false;
				if (isHTMLElement && data.callback)
				{
					r = data.callback.call(this, node);
				}

				if (!r && this.onItemSelected)
				{
					this.onItemSelected(node.data, node);
				}
				this._skipScroll = false;
			}
		};

		const onNodeDblClicked = (e: MouseEvent) =>
		{
			const node = row;
			const title = node.titleElement.querySelector(".incontent") as TreeTitleElement;

			Trigger(this.root, "item_dblclicked", node); // LEGACY

			if (!title.isEditing && this.options.allowRename)
			{
				title.isEditing = true;
				title.oldName = title.innerHTML;
				const that2 = title;
				title.innerHTML = `<input type='text' value='${title.innerHTML}' />`;
				const input = title.querySelector("input");

				if (input)
				{
					// Loose focus when renaming
					input.addEventListener("blur", (e: FocusEvent) =>
					{
						const target = e?.target;
						const newName = target ? (target as HTMLInputElement).value ?? "" : "";
						// Bug fix, if I destroy input inside the event, it produce a NotFoundError
						setTimeout(() => { that2.innerHTML = newName; }, 1);
						delete that2.isEditing;
						Trigger(this.root, "item_renamed", { oldName: that2.oldName, newName: newName, item: node, data: node.data });
						delete that2.oldName;
					});

					// Finishes renaming
					input.addEventListener("keydown", (e: KeyboardEvent) =>
					{
						if (e.key != "Enter") { return; }
						input.blur();
					});

					// Set on focus
					input.focus();
				}

				e.preventDefault();
			}

			e.preventDefault();
			e.stopPropagation();
		};
		row.addEventListener("click", onNodeSelected.bind(row));
		row.addEventListener("dblclick", onNodeDblClicked.bind(row));
		const contextMenuCallback = (e: PointerEvent) =>
		{
			const item = row;
			e.preventDefault();
			e.stopPropagation();

			if (e.button != 2) { return; } // Right button

			if (this.onItemContextMenu)
			{
				return this.onItemContextMenu(e, { item: item, data: item.data });
			}

			return false;
		};
		row.addEventListener("contextmenu", contextMenuCallback);

		// Dragging element on tree
		const draggableElement = titleElement;
		if (this.options.allowDrag)
		{
			draggableElement.draggable = true;

			// Starts dragging this element
			draggableElement.addEventListener("dragstart", (ev: DragEvent) =>
			{
				ev.dataTransfer?.setData("itemID",
					(draggableElement.parentNode && "dataset" in draggableElement.parentNode &&
						draggableElement.parentNode.dataset ?
						(draggableElement.parentNode as TreeNode).dataset.itemID ?? "" : ""));
				if (data.onDragData)
				{
					const dragData = data.onDragData();
					if (dragData)
					{
						for (const i in dragData)
						{
							ev.dataTransfer?.setData(i, dragData[i]);
						}
					}
				}
			});
		}

		let count = 0;

		// Something being dragged entered
		draggableElement.addEventListener("dragenter", (ev) =>
		{
			ev.preventDefault();
			if ("skipDrag" in data && data.skipDrag) { return false; }

			if (count == 0) { titleElement.classList.add("dragover"); }
			count++;
			return;
		});

		draggableElement.addEventListener("dragleave", (ev) =>
		{
			ev.preventDefault();
			count--;
			if (count == 0)
			{
				titleElement.classList.remove("dragover");
			}
			return;
		});

		// Test if allows to drag stuff on top?
		draggableElement.addEventListener("dragover", _onDragOver);
		function _onDragOver(ev: DragEvent)
		{
			ev.preventDefault();
		}

		draggableElement.addEventListener("drop", (ev: DragEvent) =>
		{
			const el = ev.target as HTMLElement;
			draggableElement.classList.remove("dragover");
			ev.preventDefault();
			count = 0;
			if ("skipDrag" in data && data.skipDrag) { return false; }

			const itemID = ev.dataTransfer?.getData("itemID");
			// Find the closest tree item (li) being dropped onto
			const parentNode = el.closest("li") as TreeNode;

			if (!itemID)
			{
				Trigger(this.root, "drop_on_item", { item: el, event: ev });
				// Use parentNode data if available, otherwise fallback (or just don't crash)
				if (this.onDropItem && parentNode) { this.onDropItem(ev, parentNode.data); }
				return;
			}

			if (!parentNode || !("dataset" in parentNode)) { return; }
			const parentID = parentNode.dataset.itemID;

			if (parentID && (!this.onMoveItem || (this.onMoveItem && this.onMoveItem(this.getItem(itemID), this.getItem(parentID)) != false)))
			{
				if (this.moveItem(itemID, parentID))
				{
					Trigger(this.root, "item_moved", { item: this.getItem(itemID), parent_item: this.getItem(parentID) });
				}
			}

			if (this.onDropItem) { this.onDropItem(ev, parentNode.data); }
			return;
		});

		return root;
	}

	/**
	 * Remove from the tree the items that do not have a name that matches the string.
	 * @param {string} name - The string to search for.
	 */
	filterByName(name: string): void
	{
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as TreeNode; // Ltreeitem
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			const content = childNode.querySelector(".incontent");
			if (!content) { continue; }

			const str = content.innerHTML.toLowerCase();

			if (!name || str.indexOf(name.toLowerCase()) != -1)
			{
				if (childNode.data && childNode.data.visible)
				{
					childNode.classList.remove("filtered");
				}
				const indent = childNode.querySelector(".indentblock") as HTMLElement;
				if (indent)
				{
					if (name)
					{
						indent.style.paddingLeft = "0px";
					}
					else
					{
						indent.style.paddingLeft = /* PaddingLeft = */ ((parseInt(childNode.dataset.level ?? "") + this.indentOffset) * Tree.INDENT) + "px";
					}
				}
			}
			else
			{
				childNode.classList.add("filtered");
			}
		}
	}

	/**
	 * Remove from the tree the items that do not match the rule.
	 * @param {Function} filterCallback - Callback that returns true if item should be kept.
	 * @param {string} name - Name to pass to the callback.
	 */
	filterByRule(filterCallback: (data: TreeData, content: HTMLElement, name: string) => boolean,
		name: string): void
	{
		if (!filterCallback) { throw ("filterByRule requires a callback"); }
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as TreeNode; // Ltreeitem
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			const content = childNode.querySelector(".incontent") as HTMLElement;
			if (!content) { continue; }

			if (filterCallback(childNode.data, content, name))
			{
				if (childNode.data && childNode.data.visible !== false)
				{
					childNode.classList.remove("filtered");
				}
				const indent = childNode.querySelector(".indentblock") as HTMLElement;
				if (indent)
				{
					if (name)
					{
						indent.style.paddingLeft = "0px";
					}
					else
					{
						indent.style.paddingLeft = ((parseInt(childNode.dataset.level ?? "") + this.indentOffset) * Tree.INDENT) + "px";
					}
				}
			}
			else
			{
				childNode.classList.add("filtered");
			}
		}
	}


	/**
	 * Get the item with that id, returns the HTML element.
	 * @param {string | TreeNode} id - ID or the node itself.
	 * @returns {TreeNode | undefined} The tree node.
	 */
	getItem(id: string | TreeNode): TreeNode | undefined
	{
		if (!id) { return undefined; }

		if (typeof id != "string" && id.classList) { return id; } // If it is already a node

		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			if (childNode.dataset.itemID === id)
			{
				return childNode;
			}
		}

		return undefined;
	}

	/**
	 * In case an item is collapsed, it expands it to show children.
	 * @param {string | TreeNode} id - ID or the node to expand.
	 * @param {boolean} [parents] - If true, expands parents as well.
	 */
	expandItem(id: string | TreeNode, parents: boolean): void
	{
		const item = this.getItem(id);
		if (!item) { return; }
		if (typeof item == "string") { return; }
		if (!item.listBox) { return; }

		item.listBox.setValue(true); // This propagates changes

		if (!parents) { return; }

		const parent = this.getParent(item);
		if (parent) { this.expandItem(parent, parents); }
	}

	/**
	 * In case an item is expanded, it collapses it to hide children.
	 * @param {string} id - ID of the item to collapse.
	 */
	collapseItem(id: string): void
	{
		const item = this.getItem(id) as TreeNode;
		if (!item) { return; }

		if (!item.listBox) { return; }

		item.listBox.setValue(false);  // This propagates changes
	}


	/**
	 * Tells you if the item its out of the view due to the scrolling.
	 * @param {string | TreeNode} id - ID or the node to check.
	 * @returns {boolean} True if inside the visible area.
	 */
	isInsideArea(id: string): boolean
	{
		const item = typeof id === "string" ? this.getItem(id) : id;
		if (!item) { return false; }

		const rects = this.root.getClientRects();
		if (!rects.length) { return false; }
		const r = rects[0];
		const h = r.height;
		const y = item.offsetTop;

		if (this.root.scrollTop < y && y < (this.root.scrollTop + h))
		{
			return true;
		}
		return false;
	}

	/**
	 * Scrolls to center this item.
	 * @param {string | TreeNode} item - ID or the node to scroll to.
	 */
	scrollToItem(item: string | TreeNode): void
	{
		item = (typeof item === "string" ? this.getItem(item) : item) as TreeNode;
		if (!item) { return; }

		const container = this.root.parentNode as HTMLDivElement;

		if (!container) { return; }

		const rect = container.getBoundingClientRect();
		const h = rect.height; // If this function is misbehaving then remove this line and find another way to get "h"
		if (!rect) { return; }
		const x = (parseInt(item.dataset.level ?? "0") + this.indentOffset) * Tree.INDENT + 50;

		container.scrollTop = item.offsetTop - (h * 0.5) | 0;
		if (rect.width * 0.75 < x)
		{
			container.scrollLeft = x;
		}
		else
		{
			container.scrollLeft = 0;
		}
	}

	/**
	 * Mark item as selected.
	 * @param {string} id - ID of the item to select.
	 * @param {boolean} [scroll] - whether to scroll to the item.
	 * @param {boolean} [sendEvent] - whether to trigger click event.
	 * @returns {string | TreeNode | null | undefined} The selected node.
	 */
	setSelectedItem(id: string, scroll: boolean, sendEvent: boolean): string | TreeNode | null | undefined
	{
		if (!id)
		{
			// Clear selection
			this._unmarkAllAsSelected();
			return;
		}

		const node = this.getItem(id);
		if (!node) { return null; }// Not found

		// Already selected
		if ((node as TreeNode).classList.contains("selected")) { return; }

		this._markAsSelected(node as TreeNode);
		if (scroll && !this._skipScroll) { this.scrollToItem(node); }

		// Expand parents
		this.expandItem(node, true);

		if (sendEvent) { Trigger(node, "click"); }

		return node;
	}

	/**
	 * Adds item to selection (multiple selection).
	 * @param {string} id - ID of the item.
	 * @returns {string | TreeNode | null | undefined} The selected node.
	 */
	addItemToSelection(id: string): string | TreeNode | null | undefined
	{
		if (!id) { return; }

		const node = this.getItem(id);
		if (!node) { return null; } // Not found

		this._markAsSelected(node as TreeNode, true);
		return node;
	}

	/**
	 * Remove item from selection (multiple selection).
	 * @param {string} id - ID of the item.
	 */
	removeItemFromSelection(id: string)
	{
		if (!id) { return; }
		const node = this.getItem(id);
		if (!node) { return null; } // Not found
		(node as TreeNode).classList.remove("selected");
		return;
	}

	/**
	 * Returns the first selected item (its HTML element).
	 * @returns {Element | null} The selected element.
	 */
	getSelectedItem(): Element | null
	{
		return this.root.querySelector(".ltreeitem.selected");
	}

	/**
	 * Returns an array with the selected items (its HTML elements).
	 * @returns {NodeListOf<Element>} The selected elements.
	 */
	getSelectedItems(): NodeListOf<Element>
	{
		return this.root.querySelectorAll(".ltreeitem.selected");
	}

	/**
	 * Returns if an item is selected.
	 * @param {string} id - ID of the item.
	 * @returns {boolean} True if selected.
	 */
	isItemSelected(id: string): boolean
	{
		const node = this.getItem(id);
		if (!node) { return false; }
		return this._isNodeSelected(node as TreeNode);
	}

	/**
	 * Returns the children of an item.
	 * @param {string | TreeNode} id - could be string or node directly.
	 * @param {boolean} [onlyDirectChildren=false] - to get only direct children.
	 * @returns {TreeNode[] | undefined} The children nodes.
	 */
	getChildren(id: string | TreeNode, onlyDirectChildren: boolean = false): TreeNode[] | undefined
	{
		if (typeof id !== "string")
		{
			id = id.dataset.itemID as string;
		}
		return this._findChildElements(id, onlyDirectChildren);
	}

	/**
	 * Returns the parent of a item.
	 * @param {string | TreeNode} id - ID or node.
	 * @returns {TreeNode | undefined} The parent node.
	 */
	getParent(id: string | TreeNode): TreeNode | undefined
	{
		const element = this.getItem(id);
		if (element) { return this.getItem(element.parentId); }
		return;
	}

	/**
	 * Returns an array with all the ancestors
	 * @param {string | TreeNode} id - ID or node.
	 * @param {Array<string | TreeNode>} result - Array to store results.
	 * @returns {Array<TreeNode | string>} The ancestors.
	 */
	getAncestors(id: string | TreeNode, result: Array<string | TreeNode>): Array<TreeNode | string>
	{
		result = result ?? [];
		const element = this.getItem(id);
		if (element)
		{
			result.push(element);
			return this.getAncestors(element.parentId, result);
		}
		return result;
	}

	/**
	 * Checks if a node is an ancestor of another.
	 * @param {string | TreeNode} child - Child node.
	 * @param {string | TreeNode} node - Potential ancestor.
	 * @returns {boolean | Array<TreeNode | string>} True if is ancestor (or returns array/boolean? implementation returns boolean usually but type says Array|boolean).
	 */
	isAncestor(child: string | TreeNode, node: string | TreeNode): Array<TreeNode | string> | boolean
	{
		const element = this.getItem(child) as TreeNode;
		if (!element) { return false; }
		const dest = this.getItem(node);
		const parent = this.getItem(element.parentId);
		if (!parent) { return false; }
		if (parent == dest) { return true; }
		return this.isAncestor(parent, node);
	}

	/**
	 * Move item with id to be child of parent_id.
	 * @param {string} id - ID of the item to move.
	 * @param {string} parentId - ID of the new parent.
	 * @returns {boolean} True if moved.
	 */
	moveItem(id: string, parentId: string): boolean
	{
		if (id === parentId) { return false; }

		const node = this.getItem(id) as TreeNode;
		const parent = this.getItem(parentId);

		if (!parent || !node) { return false; }

		if (this.isAncestor(parent, node)) { return false; }

		const parentLevel = parseInt(parent.dataset.level ?? "0");
		const oldParent = this.getParent(node);
		if (!oldParent)
		{
			console.error("node parent not found by id, maybe id has changed");
			return false;
		}
		const oldParentLevel = parseInt(oldParent.dataset.level ?? "0");
		const leveOffset = parentLevel - oldParentLevel;

		if (parent == oldParent) { return false; }

		// Replace parent info
		node.parentId = parentId;

		// Get all children and reinsert them in the new level
		const children = this.getChildren(node);
		if (children)
		{
			children.unshift(node); // Add the node at the beginning

			// Remove all children
			for (let i = 0; i < children.length; i++)
			{
				children[i].parentNode!.removeChild(children[i]);
			}

			// Update levels
			for (let i = 0; i < children.length; i++)
			{
				const child = children[i];
				const newLevel = parseInt(child.dataset.level ?? "0") + leveOffset;
				child.dataset.level = newLevel.toString();
			}

			// Reinsert
			for (let i = 0; i < children.length; i++)
			{
				const child = children[i];
				let currentParentIndex = -1;

				if (child === node)
				{
					currentParentIndex = this._findElementIndex(parent);
				}
				else
				{
					currentParentIndex = this._findElementIndex(child.parentId);
				}

				if (currentParentIndex === -1)
				{
					console.error("Parent not found for reinsertion", child);
					continue;
				}

				// Use a large offset to append to the end
				this._insertInside(child, currentParentIndex, 999999, parseInt(child.dataset.level ?? "0"));
			}
		}

		// Update collapse button
		this._updateListBox(parent as TreeNode);
		if (oldParent) { this._updateListBox(oldParent); }

		return true;
	}

	/**
	 * Remove item with given id.
	 * @param {string | TreeNode} item - ID or node to remove.
	 * @param {boolean} removeChildren - whether to remove children as well.
	 * @returns {boolean} True if removed.
	 */
	removeItem(item: string | TreeNode, removeChildren: boolean): boolean
	{
		let node = item;
		if (typeof (item) == "string") { node = this.getItem(item)!; }
		if (!node) { return false; }

		// Get parent
		const parent = this.getParent(node);

		// Get all descendants
		let child_nodes = null;
		if (removeChildren) { child_nodes = this.getChildren(node); }

		// Remove html element
		this.root.removeChild(node as TreeNode);

		// Remove all children
		if (child_nodes)
		{
			for (let i = 0; i < child_nodes.length; i++)
			{
				this.root.removeChild(child_nodes[i]);
			}
		}

		// Update parent collapse button
		if (parent) { this._updateListBox(parent as TreeNode); }
		return true;
	}

	/**
	 * Update a given item with new data.
	 * @param {string} id - ID of the item to update.
	 * @param {TreeData | TreeNode} data - New data.
	 * @returns {boolean} True if updated.
	 */
	updateItem(id: string, data: TreeData | TreeNode): boolean
	{
		const node = this.getItem(id) as TreeNode;
		if (!node) { return false; }

		const isTreeNode = data instanceof HTMLElement;

		node.data = isTreeNode ? node.data : data;
		if (isTreeNode && data.id) { node.id = data.id; }
		if (isTreeNode && data.content)
		{
			const inContent = node.titleElement?.querySelector(".incontent");
			if (inContent)
			{
				inContent.innerHTML = data.content;
			}
		}

		return true;
	}

	/**
	 * Update a given item id and the link with its children.
	 * @param {string} oldId - Old ID.
	 * @param {string} newId - New ID.
	 * @returns {boolean} True if updated.
	 */
	updateItemId(oldId: string, newId: string): boolean
	{
		const node = this.getItem(oldId) as TreeNode;
		if (!node) { return false; }

		const children = this.getChildren(oldId, true);
		node.id = newId;

		if (!children) { return false; }

		for (let i = 0; i < children.length; ++i)
		{
			const child = children[i];
			child.parentId = newId;
		}

		return true;
	}


	/**
	 * Clears all the items.
	 * @param {boolean} keepRoot - if you want to keep the root item.
	 */
	clear(keepRoot: boolean)
	{
		if (!keepRoot)
		{
			this.root.innerHTML = "";
			return;
		}

		const items = this.root.querySelectorAll(".ltreeitem");
		for (let i = 1; i < items.length; i++)
		{
			const item = items[i];
			this.root.removeChild(item);
		}
	}


	/**
	 * Gets a node by its index in the DOM.
	 * @param {number} index - Index of the node.
	 * @returns {Element} The node element.
	 */
	getNodeByIndex(index: number): Element
	{
		const items = this.root.querySelectorAll(".ltreeitem");
		return items[index];
	}

	// Private

	/**
	 * Checks if the children of a node are visible.
	 * @private
	 * @param {string | TreeNode} id - The ID or the node itself.
	 * @returns {boolean} True if children are visible.
	 */
	private _isNodeChildrenVisible(id: string | TreeNode): boolean
	{
		const node = this.getItem(id);
		if (!node) { return false; }
		if (node.classList.contains("hidden")) { return false; }

		// Check listboxes
		const listbox = node.querySelector(".listbox") as ListBoxSpanElement;
		if (!listbox) { return true; }
		if (listbox.listBox?.getValue() == "closed") { return false; }
		return true;
	}

	/**
	 * Finds a node element by its ID.
	 * @private
	 * @param {string} id - The item's ID.
	 * @returns {TreeNode | undefined} Thefound node or undefined.
	 */
	private _findElement(id: string)
	{
		if (!id || typeof id !== "string")
		{
			throw ("findElement param must be string with item id");
		}
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}
			if (childNode.classList.contains("ltreeitem-" + id))
			{
				return childNode;
			}
		}

		return;
	}

	/**
	 * Finds the index of a node in the DOM list.
	 * @private
	 * @param {string | TreeNode} id - The ID or the node itself.
	 * @returns {number} The index, or -1 if not found.
	 */
	private _findElementIndex(id: string | TreeNode): number
	{
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			if (typeof (id) === "string")
			{
				if (childNode.dataset.itemID === id)
				{
					return i;
				}
			}
			else if (childNode === id)
			{
				return i;
			}
		}

		return -1;
	}

	/**
	 * Finds the index of the last child of a node.
	 * @private
	 * @param {number} startIndex - The index of the parent node.
	 * @returns {number} The index of the last child.
	 */
	private _findElementLastChildIndex(startIndex: number): number
	{
		if (startIndex == -1)
		{
			return -1;
		}

		const level = parseInt(this.root.childNodes[startIndex].dataset.level ?? "0");

		for (let i = startIndex + 1; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as TreeNode;
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			const currentLevel = parseInt(childNode.dataset.level ?? "0");
			if (currentLevel == level)
			{
				return i;
			}
		}

		return -1;
	}

	/**
	 * Finds child elements of a node.
	 * @private
	 * @param {string} id - The parent ID.
	 * @param {boolean} onlyDirectChildren - If true, returns only direct children.
	 * @returns {TreeNode[] | undefined} Array of child nodes.
	 */
	private _findChildElements(id: string, onlyDirectChildren: boolean): TreeNode[] | undefined
	{
		const parentIndex = this._findElementIndex(id);
		if (parentIndex == -1)
		{
			return;
		}

		const parent = this.root.childNodes[parentIndex];
		const parentLevel = parseInt(parent.dataset.level ?? "0");

		const result = [];

		for (let i = parentIndex + 1; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			const currentLevel = parseInt(childNode.dataset.level ?? "0");
			if (onlyDirectChildren && currentLevel > (parentLevel + 1)) { continue; }
			if (currentLevel <= parentLevel) { return result; }

			result.push(childNode);
		}

		return result;
	}

	/**
	 * Unmarks all nodes as selected.
	 * @private
	 */
	private _unmarkAllAsSelected()
	{
		this.root.classList.remove("selected");
		const selected_array = this.root.querySelectorAll(".ltreeitem.selected");
		if (selected_array)
		{
			for (let i = 0; i < selected_array.length; i++)
			{
				selected_array[i].classList.remove("selected");
			}
		}
		const semiSelected = this.root.querySelectorAll(".ltreeitem.semiselected");
		for (let i = 0; i < semiSelected.length; i++)
		{
			semiSelected[i].classList.remove("semiselected");
		}
	}

	/**
	 * Checks if a node is selected.
	 * @private
	 * @param {TreeNode} node - The node to check.
	 * @returns {boolean} True if selected.
	 */
	private _isNodeSelected(node: TreeNode): boolean
	{
		// Already selected
		if (node.classList.contains("selected")) { return true; }
		return false;
	}

	/**
	 * Marks a node as selected.
	 * @private
	 * @param {TreeNode} node - The node to select.
	 * @param {boolean} [addToExistingSelection=false] - If true, adds to current selection instead of clearing it.
	 */
	private _markAsSelected(node: TreeNode, addToExistingSelection: boolean = false)
	{
		// Already selected
		if (node.classList.contains("selected")) { return; }

		// Clear old selection
		if (!addToExistingSelection) { this._unmarkAllAsSelected(); }

		// Mark as selected (it was node.titleElement?)
		node.classList.add("selected");

		// Go up and soft select
		let parent = this.getParent(node);
		const visited = [];
		while (parent && visited.indexOf(parent) == -1)
		{
			parent.classList.add("semiselected");
			visited.push(parent);
			parent = this.getParent(parent) as TreeNode;
		}
	}

	/**
	 * Updates the listbox (collapse/expand icon) of a node.
	 * @private
	 * @param {TreeNode} node - The node to update.
	 * @param {TreeOptions} [options] - Options.
	 * @param {number} [currentLevel=0] - Current indentation level.
	 */
	private _updateListBox(node: TreeNode, options?: TreeOptions, currentLevel: number = 0)
	{
		if (!node) { return; }

		if (!node.listBox)
		{
			const pre = node.titleElement?.querySelector(".collapsebox");
			if (!pre) { return; }

			const box = new ListBox(true, (value: string) =>
			{
				this._onClickBox(node);
				Trigger(this.root, "item_collapse_change",
					{
						item: node,
						data: value
					});
			});
			const element = box.root;
			if (element)
			{
				box.stopPropagation = true;
				element.setEmpty(true);
				pre.appendChild(element);
				node.listBox = element;
			}
		}

		if ((options && options.collapsed) || currentLevel >= this.collapsedDepth)
		{
			node.listBox?.collapse();
		}

		const children = this.getChildren(node.dataset.itemID ?? "");
		if (!children) { return; }

		if (children.length)
		{
			node.listBox?.setEmpty(false);
		}
		else
		{
			node.listBox?.setEmpty(true);
		}
	}

	private _onClickBox(node: string | TreeNode)
	{
		const children = this.getChildren(node);

		if (!children) { return; }

		// Update children visibility
		for (let i = 0; i < children.length; ++i)
		{
			const child = children[i];

			const child_parent = this.getParent(child);
			let visible = true;
			if (child_parent) { visible = this._isNodeChildrenVisible(child_parent); }
			if (visible)
			{
				child.classList.remove("hidden");
			}
			else
			{
				child.classList.add("hidden");
			}
		}
	}

}
