import { LiteGUIObject } from "./@types/globals";
import { LiteGUI } from "./core";
import { SizeToCSS, Trigger } from "./utilities";

/**
 * Configuration options for the Area component.
 */
export interface AreaOptions
{
    /**
     * Minimum size for the split sections.
     * @default 10
     */
    minSplitSize?: number;
    /**
     * If true, the resize event will be fired while dragging the splitter.
     */
    immediateResize?: boolean;
    /**
     * Unique identifier for the area's root element.
     */
    id?: string,
    /**
     * CSS class name to add to the root element.
     */
    className?: string,
    /**
     * Width of the area. Can be a number (pixels) or string (CSS value).
     * @default "100%"
     */
    width?: number | string,
    /**
     * Height of the area. Can be a number (pixels) or string (CSS value).
     * @default "100%"
     */
    height?: number | string,
    /**
     * ID to assign to the content element of the area.
     */
    contentId?: string,
    /**
     * If true, the area will listen to the global LiteGUI 'resized' event.
     */
    autoresize?: boolean,
    /**
     * Indicates if this is the main area.
     */
    main?: boolean
    /**
     * Callback fired on resize.
     */
    onResize?: () => void;
}

/**
 * Interface extending HTMLDivElement to include a reference to the Area instance.
 */
export interface AreaElement extends HTMLDivElement
{
    /**
     * Reference to the Area instance associated with this element.
     */
    litearea?: Area,
}

/**
 * An Area is an stretched container.
 * Areas can be split several times horizontally or vertically to fit different columns or rows
 *
 * @class Area
 * @param {AreaOptions} [options] Configuration options.
 * @example
 * ```typescript
 * const mainArea = new LiteGUI.Area({ id: "main", contentId: "canvasarea", height: "100%" });
 * mainArea.split("vertical", ["50%", null], true);
 * ```
 */
export class Area implements LiteGUIObject
{
	/**
	 * The root HTML element of the area.
	 */
	root: AreaElement;
	/**
	 * Configuration options.
	 */
	options: AreaOptions;
	/**
	 * The content element of the area.
	 */
	content: HTMLDivElement;
	/**
	 * Direction of the split ("vertical", "horizontal" or "none").
	 */
	splitDirection: string;
	/**
	 * Sub-sections of this area if split.
	 */
	sections: Area[];
	/**
	 * Current direction.
	 */
	direction?: string;
	/**
	 * Split bar element if split.
	 */
	splitbar?: HTMLDivElement;
	/**
	 * Reference to the dynamic section (the one that resizes).
	 */
	dynamicSection?: Area;
	/**
	 * Size of the area.
	 */
	size?: number | string | null;
	/**
	 * @private Computed size.
	 */
	private _computedSize: number[];

	/**
	 * Vertical constant.
	 */
	public static VERTICAL: "vertical" = "vertical" as const;
	/**
	 * Horizontal constant.
	 */
	public static HORIZONTAL: "horizontal" = "horizontal" as const;
	/**
	 * Default size of the splitbar.
	 */
	public static splitbarSize = 4;

	/**
	 * Creates an instance of the Area class.
	 * @param {AreaOptions} [options] Configuration options.
	 */
	constructor(options: AreaOptions = {})
	{
		/* The root element containing all sections */
		const root = document.createElement("div") as AreaElement;
		root.className = "litearea";
		if (options?.id) { root.id = options.id; }
		if (options?.className) { root.className += ` ${options.className}`; }

		this.root = root;
		this.root.litearea = this;

		let width = options?.width || "100%";
		let height = options?.height || "100%";

		if (typeof (width) == 'number' && width < 0)
		{
			width = `calc( 100% - ${Math.abs(width)}px)`;
		}
		if (typeof (height) == 'number' && height < 0)
		{
			height = `calc( 100% - ${Math.abs(height)}px)`;
		}

		root.style.width = typeof width === 'number' ? `${width}px` : width;
		root.style.height = typeof height === 'number' ? `${height}px` : height;

		this.options = options;

		this._computedSize = [this.root.offsetWidth, this.root.offsetHeight];

		const content = document.createElement("div");
		if (options?.contentId) { content.id = options.contentId; }
		content.className = "liteareacontent";
		content.style.width = "100%";
		content.style.height = "100%";
		this.root.appendChild(content);
		this.content = content;

		this.splitDirection = "none";
		this.sections = [];

		if (options?.autoresize)
		{
			LiteGUI.bind(LiteGUI, "resized", () =>
			{
				this.onResize();
			});
		}
	}
	/**
	 * Get section by index.
	 * @param {number} num Index of the section (0 or 1).
	 * @returns {Area | null} The section area or null if not found.
	 */
	getSection(num: number)
	{
		num = num ?? 0;
		if (this.sections.length > num)
		{
			return this.sections[num];
		}
		return null;
	}

	/**
	 * Callback fired when the area is resized.
	 * @param {PointerEvent | MouseEvent} [event] Event object.
	 */
	onResize(event?: PointerEvent | MouseEvent)
	{
		const computedSize = [this.root.offsetWidth, this.root.offsetHeight];
		if (event && this._computedSize && computedSize[0] ==
            this._computedSize[0] && computedSize[1] == this._computedSize[1])
		{
			return;
		}

		this.sendResizeEvent(event);
	}

	/**
	 * Sends the resize event to all the sections.
	 * @param {PointerEvent | MouseEvent} [e] Event object.
	 */
	sendResizeEvent(e?: PointerEvent | MouseEvent)
	{
		if (this.sections.length)
		{
			for (const i in this.sections)
			{
				const section = this.sections[i];
				section.onResize(e);
			}
		}
		else // Send it to the children
		{
			for (let j = 0; j < this.root.childNodes.length; j++)
			{
				const element = this.root.childNodes[j] as AreaElement;
				if (element.litearea)
				{
					element.litearea.onResize();
				}
				else
				{
					Trigger(element, "resize");
				}
			}
		}
		SizeToCSS();
		// Inner callback
		if (this.options.onResize) { this.options.onResize(); }
	}

	/**
	 * Gets the width of the root element.
	 * @type {number}
	 */
	public get getWidth(): number | null | string
	{
		return this.root.offsetWidth;
	}

	/**
	 * Gets the height of the root element.
	 * @type {number}
	 */
	public get getHeight(): number | null | string
	{
		return this.root.offsetHeight;
	}

	/**
	 * Checks if the area is visible.
	 * @type {boolean}
	 */
	public get isVisible(): boolean
	{
		return this.root.style.display != "none";
	}

	/**
	 * Adjusts the height of the area to fill the remaining space in the parent.
	 */
	adjustHeight()
	{
		if (!this.root.parentNode)
		{
			console.error("Cannot adjust height of LiteGUI.Area without parent");
			return;
		}

		const parentHeight = (this.root.parentNode as AreaElement).offsetHeight;

		// Check position
		const y = this.root.getClientRects()[0].top + parentHeight;

		// Adjust height
		this.root.style.height = "calc( 100% - " + y + "px )";
	}

	/**
	 * Splits the area into two sections.
	 * @param {"vertical" | "horizontal"} direction Direction of the split.
	 * @param {(string | null | number)[]} sizes Array containing the sizes. One must be null to be dynamic.
	 * @param {boolean} editable If true, a draggable bar is created.
	 */
	split(direction: "vertical" | "horizontal", sizes?: (string | null | number)[], editable?: boolean)
	{
		if (typeof direction !== 'string')
		{
			throw ("First parameter must be a string: 'vertical' or 'horizontal'");
		}

		if (direction != "vertical" && direction != "horizontal")
		{
			throw ("First parameter must be a string: 'vertical' or 'horizontal'");
		}

		sizes = sizes ?? ["50%", null];

		if (this.sections.length) { throw "cannot split twice"; }

		// Create areas
		const area1 = new Area({ contentId: this.content.id } as AreaOptions);
		area1.root.style.display = "inline-block";
		const area2 = new Area();
		area2.root.style.display = "inline-block";

		let splitinfo = "";
		let splitbar: HTMLDivElement | undefined;
		let dynamicSection: Area | undefined;
		const _onMouseDown = (e: MouseEvent) =>
		{
			const doc = this.root.ownerDocument;
			doc.addEventListener("mousemove", _onMouseMove);
			doc.addEventListener("mouseup", _onMouseUp);
			lastPos[0] = e.pageX;
			lastPos[1] = e.pageY;
			e.stopPropagation();
			e.preventDefault();
		};
		if (editable)
		{
			splitinfo = ` - ${(Area.splitbarSize + 2)}px`;
			splitbar = document.createElement("div");
			splitbar.className = `litesplitbar ${direction}`;
			if (direction == "vertical")
			{
				splitbar.style.height = `${Area.splitbarSize}px`;
			}
			else
			{
				splitbar.style.width = `${Area.splitbarSize}px`;
			}
			this.splitbar = splitbar;
			splitbar.addEventListener("mousedown", _onMouseDown);
		}

		if (direction == "vertical")
		{
			area1.root.style.width = "100%";
			area2.root.style.width = "100%";

			if (sizes[0] == null)
			{
				let h = sizes[1];
				if (typeof (h) == "number")
				{
					h = `${sizes[1]}px`;
				}

				area1.root.style.height = `calc( 100% - ${h + splitinfo} )`;
				area2.root.style.height = h!;
				area2.size = h;
				dynamicSection = area1;
			}
			else if (sizes[1] == null)
			{
				let h = sizes[0];
				if (typeof (h) == "number")
				{
					h = `${sizes[0]}px`;
				}

				area1.root.style.height = h;
				area1.size = h;
				area2.root.style.height = `calc( 100% - ${h + splitinfo} )`;
				dynamicSection = area2;
			}
			else
			{
				let h1 = sizes[0];
				if (typeof (h1) == "number")
				{
					h1 = `${sizes[0]}px`;
				}
				let h2 = sizes[1];
				if (typeof (h2) == "number")
				{
					h2 = `${sizes[1]}px`;
				}
				area1.root.style.height = h1;
				area1.size = h1;
				area2.root.style.height = h2;
				area2.size = h2;
			}
		}
		else // Horizontal
		{
			area1.root.style.height = "100%";
			area2.root.style.height = "100%";

			if (sizes[0] == null)
			{
				let w = sizes[1];
				if (typeof (w) == "number")
				{
					w = `${sizes[1]}px`;
				}
				area1.root.style.width = `calc( 100% - ${w + splitinfo} )`;
				area2.root.style.width = w!;
				area2.size = sizes[1];
				dynamicSection = area1;
			}
			else if (sizes[1] == null)
			{
				let w = sizes[0];
				if (typeof (w) == "number")
				{
					w = `${sizes[0]}px`;
				}

				area1.root.style.width = w;
				area1.size = w;
				area2.root.style.width = `calc( 100% - ${w + splitinfo} )`;
				dynamicSection = area2;
			}
			else
			{
				let w1 = sizes[0];
				if (typeof (w1) == "number")
				{
					w1 = `${sizes[0]}px`;
				}
				let w2 = sizes[1];
				if (typeof (w2) == "number")
				{
					w2 = `${sizes[1]}px`;
				}

				area1.root.style.width = w1;
				area1.size = w1;
				area2.root.style.width = w2;
				area2.size = w2;
			}
		}

		area1.root.removeChild(area1.content);
		area1.root.appendChild(this.content);
		area1.content = this.content;

		this.root.appendChild(area1.root);
		if (splitbar) { this.root.appendChild(splitbar); }
		this.root.appendChild(area2.root);

		this.sections = [area1, area2];
		this.dynamicSection = dynamicSection;
		this.direction = direction;

		// SPLITTER DRAGGER INTERACTION
		const lastPos = [0, 0];

		const _onMouseMove = (e: MouseEvent) =>
		{
			if (direction == "horizontal")
			{
				if (lastPos[0] != e.pageX)
				{
					this.moveSplit(lastPos[0] - e.pageX);
				}
			}
			else if (direction == "vertical")
			{
				if (lastPos[1] != e.pageY)
				{
					this.moveSplit(e.pageY - lastPos[1]);
				}
			}

			lastPos[0] = e.pageX;
			lastPos[1] = e.pageY;
			e.stopPropagation();
			e.preventDefault();
		};

		const _onMouseUp = (e: MouseEvent) =>
		{
			const doc = this.root.ownerDocument;
			doc.removeEventListener("mousemove", _onMouseMove);
			doc.removeEventListener("mouseup", _onMouseUp);
			this.onResize(e);
		};
	}

	/**
	 * Hides the area.
	 */
	hide()
	{
		this.root.style.display = "none";
	}

	/**
	 * Shows the area.
	 */
	show()
	{
		this.root.style.display = "block";
	}

	/**
	 * Shows a specific section.
	 * @param {number} num Index of the section (0 or 1).
	 */
	showSection(num: number)
	{
		let section = this.sections[num];
		let size: string | number = 0;

		if (section && section.root.style.display != "none") { return; } // Already visible

		if (this.direction == "horizontal")
		{
			size = section.root.style.width;
		}
		else
		{
			size = section.root.style.height;
		}

		if (size.indexOf("calc") != -1) { size = "50%"; }

		for (const i in this.sections)
		{
			section = this.sections[i];

			if (i == num.toString())
			{
				section.root.style.display = "inline-block";
			}
			else
			{
				if (this.direction == "horizontal")
				{
					section.root.style.width = `calc( 100% - ${size} - 5px)`;
				}
				else
				{
					section.root.style.height = `calc( 100% - ${size} - 5px)`;
				}
			}
		}

		if (this.splitbar) { this.splitbar.style.display = "inline-block"; }

		this.sendResizeEvent();
	}

	/**
	 * Hides a specific section.
	 * @param {number} num Index of the section (0 or 1).
	 */
	hideSection(num: number)
	{
		for (const i in this.sections)
		{
			const section = this.sections[i];

			if (i == num.toString())
			{
				section.root.style.display = "none";
			}
			else
			{
				if (this.direction == "horizontal")
				{
					section.root.style.width = "100%";
				}
				else
				{
					section.root.style.height = "100%";
				}
			}
		}

		if (this.splitbar) { this.splitbar.style.display = "none"; }

		this.sendResizeEvent();
	}

	/**
	 * Moves the split bar by a certain delta.
	 * @param {number} delta Amount to move in pixels.
	 */
	moveSplit(delta: number)
	{
		if (!this.sections) { return; }

		const area1 = this.sections[0];
		const area2 = this.sections[1];
		const splitinfo = ` - ${Area.splitbarSize}px`;

		const minSize = this.options?.minSplitSize ?? 10;

		if (this.direction == "horizontal")
		{

			if (this.dynamicSection == area1)
			{
				let size = (area2.root.offsetWidth + delta);
				if (size < minSize)
				{
					size = minSize;
				}
				area1.root.style.width = `calc( 100% - ${size}px ${splitinfo} )`;
				area2.root.style.width = `${size}px`; // Other split
			}
			else
			{
				let size = (area1.root.offsetWidth - delta);
				if (size < minSize)
				{
					size = minSize;
				}
				area2.root.style.width = `calc( 100% - ${size}px ${splitinfo} )`;
				area1.root.style.width = `${size}px`; // Other split
			}
		}
		else if (this.direction == "vertical")
		{
			if (this.dynamicSection == area1)
			{
				let size = (area2.root.offsetHeight - delta);
				if (size < minSize)
				{
					size = minSize;
				}
				area1.root.style.height = `calc( 100% - ${size}px ${splitinfo} )`;
				area2.root.style.height = `${size}px`; // Other split
			}
			else
			{
				let size = (area1.root.offsetHeight + delta);
				if (size < minSize)
				{
					size = minSize;
				}
				area2.root.style.height = `calc( 100% - ${size}px ${splitinfo} )`;
				area1.root.style.height = `${size}px`; // Other split
			}
		}

		Trigger(this.root, "split_moved");
		// Trigger split_moved event in all areas inside this area
		const areas = this.root.querySelectorAll(".litearea");
		for (let i = 0; i < areas.length; ++i)
		{
			Trigger(areas[i], "split_moved");
		}
	}

	/**
	 * Adds an event listener to the root element.
	 * @param {string} a Event name.
	 * @param {(e: Event) => void} b Callback function.
	 * @param {boolean | AddEventListenerOptions} [c] Options.
	 */
	addEventListener(a: string, b: (e: Event) => void, c?: boolean | AddEventListenerOptions)
	{
		return this.root.addEventListener(a, b, c);
	}

	/**
	 * Sets the size of a specific section area.
	 * @param {Area} area The area instance to resize.
	 * @param {number} size New size in pixels.
	 */
	setAreaSize(area: Area, size: number)
	{
		const splitinfo = `${size + Area.splitbarSize}px`;
		area.root.style.width = `calc( 100% - ${splitinfo} )`;
	}

	/**
	 * Merges the split sections back into one.
	 * @param {number} [mainSection=0] Index of the section to keep as main content.
	 */
	merge(mainSection?: number)
	{
		if (this.sections.length == 0) { throw "not splitted"; }

		const main = this.sections[mainSection || 0];

		this.root.appendChild(main.content);
		this.content = main.content;

		this.root.removeChild(this.sections[0].root);
		this.root.removeChild(this.sections[1].root);

		this.sections = [];
		this._computedSize = [];
		this.onResize();
	}

	/**
	 * Adds content to the area.
	 * @param {LiteGUIObject | HTMLElement | string} value Content to add (Element, LiteGUIObject with root, or HTML string).
	 */
	add(value: LiteGUIObject | HTMLElement | string)
	{
		if (typeof (value) == "string")
		{
			const element = document.createElement("div");
			element.innerHTML = value;
			value = element;
		}

		this.content.appendChild("root" in value ? value.root : value);
	}

	/**
	 * Queries for an element inside the area's root.
	 * @param {string} value CSS selector.
	 * @returns {Element | null} The found element.
	 */
	query(value: string)
	{
		return this.root.querySelector(value);
	}
}

/** *************** SPLIT ******************/

/**
 * Interface extending HTMLDivElement for Split sections.
 */
export interface SplitElement extends HTMLDivElement
{
    /**
     * Adds a child to the section.
     */
    add: (value: LiteGUIObject | HTMLElement) => void;
    /**
     * Height of the section, if number it will be converted to percentage.
     */
    height?: string | number;
    /**
     * Width of the section, if number it will be converted to percentage.
     */
    width?: string | number;
}

/**
 * Configuration options for the Split component.
 */
export interface SplitOptions
{
    id?: string;
    vertical?: boolean;
    parent?: LiteGUIObject | HTMLElement;
}

/**
 * Split component that divides an area into multiple sections.
 *
 * @class Split
 */
export class Split
{
	/**
	 * The root HTML element.
	 */
	root: HTMLElement;
	/**
	 * Array of section elements.
	 */
	sections: SplitElement[];

	/**
	 * Creates an instance of Split.
	 * @param {Array<string | number | SplitElement>} sections Definition of sections.
	 * @param {SplitOptions} [options] Options (parent, vertical, id).
	 */
	constructor(sections: Array<string | number | SplitElement>, options: SplitOptions)
	{
		options = options ?? {};

		const root = document.createElement("div") as HTMLElement;
		this.root = root;
		if (options.id) { root.id = options.id; }
		root.className = `litesplit ${options.vertical ? "vsplit" : "hsplit"}`;
		this.sections = [];

		for (const i in sections)
		{
			const section = sections[i];
			const newSection = document.createElement("div") as SplitElement;

			newSection.className = `Zsplit-section split${i}`;
			if (typeof section == "number")
			{
				if (options.vertical)
				{
					newSection.style.height = `${section.toFixed(1)}%`;
				}
				else
				{
					newSection.style.width = `${section.toFixed(1)}%`;
				}
			}
			else if (typeof section == "string")
			{
				if (options.vertical)
				{
					newSection.style.height = section;
				}
				else
				{
					newSection.style.width = section;
				}
			}
			else
			{
				if (section.id)
				{
					newSection.id = section.id;
				}
				if (options.vertical)
				{
					const height: string | number = section.height ?? "100%";
					newSection.style.height = (typeof (height) == "number" ?
						`${height.toFixed(1)}%` : height);
				}
				else
				{
					const width: string | number = section.width ?? "100%";
					newSection.style.width = (typeof (width) == "number" ?
						`${width.toFixed(1)}%` : width);
				}
			}

			newSection.add = function (element: LiteGUIObject | HTMLElement)
			{
				this.appendChild("root" in element ? element.root : element);
			};

			this.sections.push(newSection);
			root.appendChild(newSection);
		}

		if (options.parent)
		{
			if ("root" in options.parent)
			{
				options.parent.root.appendChild(root);
			}
			else
			{
				options.parent.appendChild(root);
			}
		}
	}

	/**
	 * Gets a section by index.
	 * @param {number} index Index of the section.
	 * @returns {SplitElement} The section element.
	 */
	getSection(index: number)
	{
		return this.sections[index];
	}
}