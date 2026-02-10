import { LiteGUIObject } from "./@types/globals";
import { SizeToCSS, Trigger } from "./utilities";
import { SpecialCode } from "./core";

/**
 * Interface extending HTMLDivElement to include a reference to the Panel instance.
 */
export interface PanelRoot extends HTMLDivElement
{
	/**
	 * Reference to the Panel instance associated with this element.
	 */
	panel: Panel;
	/**
	 * Unique identifier for the panel element.
	 */
	id: string;
}

/**
 * Options for configuring a Panel.
 */
export interface PanelOptions
{
	/**
	 * Optional unique identifier for the panel.
	 */
	id?: string;
	/**
	 * Whether the panel content should be scrollable.
	 * @default false
	 */
	scrollable?: boolean;
	/**
	 * Absolute position of the panel as [left, top].
	 */
	position?: (number | string)[];
	/**
	 * Height of the panel.
	 */
	height?: number | string;
	/**
	 * Width of the panel.
	 */
	width?: number | string;
	/**
	 * Title to display in the panel header.
	 */
	title?: string;
	/**
	 * Additional CSS class names for the panel.
	 */
	className?: string;
	/**
	 * Initial HTML content string for the panel.
	 */
	content?: string;
	/**
	 * Whether to handle the visibility of the panel.
	 */
	hide?: boolean;
	/**
	 * Whether to show the close button.
	 */
	close?: boolean | string;
}

/** **************** PANEL **************/

/**
 * Panel class for creating a UI panel with a header, content area, and footer.
 * @class Panel
 * @example
 * ```typescript
 * const panel = new Panel("my-panel", { title: "Settings", width: 300 });
 * document.body.appendChild(panel.root);
 * ```
 */
export class Panel implements LiteGUIObject
{
	/**
	 * Default height for the panel title.
	 */
	static TITLE_HEIGHT: string = "20px";

	/**
	 * The root HTMLDivElement of the panel.
	 */
	root: PanelRoot;

	/**
	 * Configuration options for the panel.
	 */
	options: PanelOptions;

	/**
	 * The content container element.
	 */
	content: HTMLDivElement;

	/**
	 * The footer container element.
	 */
	private _footer: HTMLDivElement;

	/**
	 * The header container element, if title is provided.
	 */
	private _header?: HTMLDivElement;

	/**
	 * Creates an instance of the Panel.
	 * @param {string | PanelOptions} id The unique identifier or an options object.
	 * @param {PanelOptions} [options] Configuration options if the first argument is an ID.
	 */
	constructor(id: string | PanelOptions, options?: PanelOptions)
	{
		if (typeof id != 'string')
		{
			const temp = id;
			id = temp.id ?? "";
			if (!options && temp != undefined)
			{
				options = temp;
			}
		}

		const op = this.options = options = options ?? {};

		const root = this.root = document.createElement("div") as PanelRoot;
		root.id = id;

		root.className = `litepanel ${op.className ?? ""}`;
		root.panel = this;

		let code = "";
		if (op.title || op.close)
		{
			let headerContent = "";
			if (op.title)
			{headerContent += `${op.title}`;}

			if (op.close)
			{
				headerContent += `<div class='buttons'><button class='litebutton mini-button close-button'>${SpecialCode.close}</button></div>`;
			}

			code += `<div class='panel-header'>${headerContent}</div>`;
		}
		code += `<div class='content'>${op.content ?? ""}</div>`;
		code += "<div class='panel-footer'></div>";
		root.innerHTML = code;

		if (op.title || op.close)
		{
			this._header = this.root.querySelector(".panel-header")!;
			if (op.close)
			{
				const closeButton = this._header.querySelector(".close-button");
				if (closeButton)
				{closeButton.addEventListener("click", this.close.bind(this));}
			}
		}

		this.content = this.root.querySelector(".content") as HTMLDivElement;
		this._footer = this.root.querySelector(".panel-footer") as HTMLDivElement;

		if (op.width) { this.root.style.width = SizeToCSS(op.width) as string; }
		if (op.height) { this.root.style.height = SizeToCSS(op.height) as string; }
		if (op.position)
		{
			this.root.style.position = "absolute";
			this.root.style.left = SizeToCSS(op.position[0]) as string;
			this.root.style.top = SizeToCSS(op.position[1]) as string;
		}

		if (op.scrollable == true) { this.content.style.overflow = "auto"; }

		if (op.hide) { this.hide(); }
	}

	/**
	 * Adds an item to the panel's content area.
	 * @param {LiteGUIObject | HTMLElement} item The item to add (either a LiteGUI component or an HTMLElement).
	 */
	add(item: LiteGUIObject | HTMLElement)
	{
		this.content.appendChild("root" in item ? item.root : item);
	}

	/**
	 * Shows the panel.
	 */
	show()
	{
		this.root.style.display = "";
		Trigger(this.root, "shown");
	}

	/**
	 * Hides the panel.
	 */
	hide()
	{
		this.root.style.display = "none";
		Trigger(this.root, "hidden");
	}

	/**
	 * Closes the panel (removes it from DOM).
	 */
	close()
	{
		if (this.root.parentNode)
		{
			this.root.parentNode.removeChild(this.root);
		}
		Trigger(this.root, "closed");
	}

	/**
	 * Clears all content from the panel.
	 */
	clear()
	{
		const content = this.content;
		while (content.firstChild != undefined)
		{
			content.removeChild(content.firstChild);
		}
	}
}