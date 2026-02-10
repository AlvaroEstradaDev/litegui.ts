import type
{
	HTMLDivElementOptions,
	InspectorSection,
	InspectorValue,
	InspectorWidget,
	InspectorWidgetTypes,
	GenericCreationOptions,
	AppendOptions,
	CreateWidgetOptions,
	ProcessElementOptions,
	WidgetChangeOptions,
	InspectorOptions,
	PropertyOptions,
	BeginGroupOptions,
	AddTitleOptions,
	AddContainerOptions,
	InspectorContainer,
	InspectorGroupWidget
} from "../@types/Inspector";
import
{
	CloneInsides,
	PurgeElement,
	Trigger,
	SizeToCSS,
	CollectProperties,
	InstanceHolder,
	AssignValue
} from "../utilities";
import { LiteGUIObject } from "../@types/globals";



/**
 * Inspector class for creating property inspectors.
 * @class Inspector
 * @example
 * ```typescript
 * const inspector = new Inspector();
 * inspector.add("string", "Name", "unnamed");
 * inspector.appendTo(document.body);
 * ```
 */
export class Inspector implements LiteGUIObject
{
	/**
	 * The root HTML element of the inspector.
	 */
	root: HTMLDivElement;
	/**
	 * List of sections within the inspector.
	 */
	sections: InspectorSection[] = [];
	/**
	 * Map of values managed by the inspector.
	 */
	values: Map<string, InspectorValue> = new Map<string, InspectorValue>();
	/**
	 * List of all widgets in the inspector.
	 */
	widgets: InspectorWidget[] = [];
	/**
	 * Map of widgets indexed by their name.
	 */
	widgetsByName: Map<string, InspectorWidget> = new Map<string, InspectorWidget>();
	// Used to detect if element is even (cannot use CSS, special cases everywhere)
	/**
	 * Internal row counter for styling even/odd rows.
	 */
	rowNumber: number = 0;
	/**
	 * Width of the name column.
	 */
	nameWidth?: number;
	/**
	 * Default width for widgets.
	 */
	widgetsWidth?: number;
	/**
	 * Current tab index for accessibility.
	 */
	tabIndex: number;
	/**
	 * Callback triggered when any value in the inspector changes.
	 */
	onChange?: (name?: string, value?: InspectorValue, element?: InspectorWidget) => void;
	/**
	 * CSS class name for the root element.
	 */
	className: string;
	/**
	 * Number of widgets to display per row.
	 */
	widgetsPerRow: number;
	/**
	 * If true, displays the inspector in a single line.
	 */
	oneLine?: boolean | null = null;
	/**
	 * The currently active section.
	 */
	currentSection?: InspectorSection;

	/**
	 * Stack of active containers.
	 * @private
	 */
	private _currentContainerStack: InspectorContainer[] = [];

	/**
	 * The current container where widgets are appended.
	 * @private
	 */
	private _currentContainer?: InspectorContainer;
	/**
	 * Callback triggered to refresh the inspector.
	 */
	onRefresh?: () => void;
	/**
	 * Hook called when a property is added.
	 */
	onAddProperty?: (name: string, instance: unknown, varname: string | number, value: unknown, options?: unknown) => void;
	/**
	 * Name of the inspector instance.
	 */
	name: string = "";
	/**
	 * Configuration options.
	 */
	options: InspectorOptions;
	/**
	 * Height of the inspector.
	 */
	height?: string | number;
	/**
	 * Counter for generating unique names for empty widgets.
	 */
	emptyWidgetIndex: number = 0;

	/**
	 * Creates an instance of the Inspector.
	 * @param {InspectorOptions} [options] Configuration options.
	 */
	constructor(options?: InspectorOptions)
	{
		this.options = options ?? {};
		const root = document.createElement("DIV") as HTMLDivElement;
		this.root = root;
		this.root.className = `inspector ${this.options.full ? "full" : ""}${this.options.className ?? ""}`;
		this.root.id = this.options.id ?? "";
		if (this.options.oneLine)
		{
			this.oneLine = true;
			this.root.className += " one_line";
		}

		this.addEmptyContainer({}); // Add empty container
		this.tabIndex = Math.floor(Math.random() * 10000);

		if (this.options.width) { this.root.style.width = SizeToCSS(this.options.width)!.toString(); }
		if (this.options.height)
		{
			this.root.style.height = SizeToCSS(this.options.height)!.toString();
			if (!this.options.oneLine) { this.root.style.overflow = "auto"; }
		}

		if (this.options.nameWidth) { this.nameWidth = this.options.nameWidth; }
		if (this.options.widgetsWidth) { this.widgetsWidth = this.options.widgetsWidth; }

		if (this.options.noscroll) { this.root.style.overflow = "hidden"; }

		if (this.options.onChange) { this.onChange = this.options.onChange; }

		if (this.options.parent) { this.appendTo(this.options.parent); }

		this.className = this.root.className;

		this.widgetsPerRow = this.options.widgetsPerRow || 1;
	}

	/**
	 * Retrieves all values from the widgets in the inspector.
	 * @returns {Map<string, InspectorValue>} A map of widget names to their values.
	 */
	getValues()
	{
		const r = new Map<string, InspectorValue>();
		for (const i in this.widgetsByName)
		{
			const widget = this.widgetsByName.get(i);
			if (widget && widget.getValue)
			{
				const w = widget.getValue();
				// If (!w) { continue; }
				r.set(i, w);
			}
		}
		return r;
	}

	/**
	 * Sets values for multiple widgets in the inspector.
	 * @param {{ [key: string]: InspectorValue }} values An object where keys are widget names and values are the new values.
	 */
	setValues(values: { [key: string]: InspectorValue })
	{
		for (const i in values)
		{
			const widget = this.widgetsByName.get(i);
			if (widget && widget.setValue)
			{
				widget.setValue(values[i]);
			}
		}
	}

	/**
	 * Appends the inspector to a parent element.
	 * @param {HTMLElement | string} parent The parent element or its selector string.
	 * @param {boolean} [atFront] If true, inserts the inspector at the beginning of the parent.
	 */
	appendTo(parent?: HTMLElement | string, atFront?: boolean)
	{
		if (!parent) { return; }

		if (typeof parent === 'string')
		{
			parent = document.querySelector(parent) as HTMLElement;
			if (!parent) { return; }
		}

		if (atFront)
		{
			parent.insertBefore(this.root, parent.firstChild);
		}
		else
		{
			parent.appendChild(this.root);
		}
	}

	/**
	 * Removes all the widgets inside the inspector
	 */
	clear()
	{
		PurgeElement(this.root);

		while (this.root.hasChildNodes())
		{
			this.root.removeChild(this.root.lastChild!);
		}

		this.root.className = this.className;

		this.rowNumber = 0;
		this.values.clear();
		this.widgets = [];
		this.widgetsByName.clear();
		this.sections = [];
		this.currentSection = undefined;
		this._currentContainer = undefined;
		this._currentContainerStack = [];
		this.addEmptyContainer();
	}

	/**
	 * Tries to refresh (calls on_refresh)
	 */
	refresh()
	{
		if (this.onRefresh)
		{
			this.onRefresh();
		}
	}

	/**
	 * Append widget to this inspector
	 * @param {InspectorWidget} widget The widget to append.
	 * @param {AppendOptions} options Configuration options for appending.
	 */
	appendWidget(widget: InspectorWidget, options?: AppendOptions)
	{
		options = options ?? {};

		const root = options.widgetParent ?? this._currentContainer ?? this.root;

		if (options.replace && options.replace.parentNode)
		{
			options.replace.parentNode.replaceChild(widget, options.replace);
		}
		else
		{
			widget.section = this.currentSection;
			root.appendChild(widget);
		}
	}

	/**
	 * Pushes a container onto the stack, making it the current active container for new widgets.
	 * @param {InspectorContainer} container The container element to push.
	 */
	pushContainer(container: InspectorContainer)
	{
		if (!this._currentContainerStack)
		{
			this._currentContainerStack = [container];
		}
		else
		{
			if (this._currentContainerStack.indexOf(container) != -1)
			{
				console.warn("Container already in the stack");
				return;
			}

			this._currentContainerStack.push(container);
		}

		this._currentContainer = container;
	}

	/**
	 * Checks if a container is currently in the stack.
	 * @param {InspectorContainer} container The container to check.
	 * @returns {boolean} True if the container is in the stack.
	 */
	isContainerInStack(container: InspectorContainer)
	{
		if (!this._currentContainerStack) { return false; }
		if (this._currentContainerStack.indexOf(container) != -1) { return true; }
		return false;
	}

	/**
	 * Pops a container from the stack, reverting to the previous container.
	 * @param {HTMLElement} [container] Optional specific container to pop up to.
	 */
	popContainer(container?: HTMLElement)
	{
		this.rowNumber = 0;
		if (this._currentContainerStack && this._currentContainerStack.length)
		{
			if (container)
			{
				let aux = this._currentContainerStack.pop();
				while (aux && aux != container)
				{ aux = this._currentContainerStack.pop(); }
			}
			else
			{
				this._currentContainerStack.pop();
			}
			this._currentContainer = this._currentContainerStack[this._currentContainerStack.length - 1];
		}
		else
		{
			this._currentContainer = undefined;
		}
	}

	/**
	 * Configures the inspector with a list of widget creation options.
	 * @param {GenericCreationOptions[]} info Array of widget configuration objects.
	 */
	setup(info: GenericCreationOptions[])
	{
		for (const i in info)
		{
			const widgetOptions = info[i];
			this.add(widgetOptions.type, widgetOptions.name, widgetOptions.value, widgetOptions.options);
		}
	}

	/**
	 * Returns the widget given the name.
	 * @param {string | number} name The name of the widget supplied when creating it or the index of the widget.
	 * @returns {InspectorWidget | undefined} The widget object or undefined if not found.
	 */
	getWidget(name: string | number)
	{
		if (name.constructor === Number)
		{
			return this.widgets[name];
		}
		return this.widgetsByName.get(name as string);
	}

	/**
	 * Inspects an instance and creates widgets for its properties.
	 * @param {unknown} instance The instance that you want to inspect, attributes will be collected from this object.
	 * @param {{[key:string]: unknown}} [properties] An object with all the names of the properties you want to inspect.
	 *		  If not specified then it calls getProperties, otherwise collect them and tries to guess the type.
	 * @param {{ [key: string]: unknown }} [propertiesInfoExample] It overwrites the info about properties found in the object (in case the automatically guessed type is wrong).
	 * @param {string[]} [skipProperties] This properties will be ignored.
	 */
	inspectInstance(instance: Record<string, unknown>, properties?: Record<string, unknown>,
		propertiesInfoExample?: Record<string, unknown>, skipProperties?: string[])
	{
		if (!instance) { return; }

		const inst = instance as Record<string, unknown>;

		if (!properties)
		{
			const instWithGetProperties = instance as { getProperties?: () => Record<string, unknown> };
			if (instWithGetProperties.getProperties)
			{
				properties = instWithGetProperties.getProperties();
			}
			else
			{
				properties = CollectProperties(instance);
			}
		}

		const classObject = inst.constructor;
		if (!propertiesInfoExample && classObject && "properties" in classObject)
		{
			propertiesInfoExample = classObject.properties as Record<string, unknown>;
		}

		/*
		 * Properties info contains  name:type for every property
		 * Must be cloned to ensure there is no overlap between widgets reusing the same container
		 */
		let propertiesValues: Record<string, unknown> = {};

		if ("getInspectorProperties" in instance && typeof instance.getInspectorProperties === "function")
		{
			propertiesValues = instance.getInspectorProperties();
		}
		else if (properties)
		{
			// Add to propertiesInfo the ones that are not specified
			for (const i in properties)
			{
				if (propertiesInfoExample && propertiesInfoExample[i])
				{
					// Clone
					propertiesValues[i] = CloneInsides(propertiesInfoExample[i] as Record<string, unknown>);
					continue;
				}

				const value = properties[i];
				if (classObject && ("@" + i) in classObject) // Guess from class object info
				{
					const sharedOptions = (classObject as unknown as Record<string, unknown>)["@" + i] as Record<string, unknown>;
					if (sharedOptions && "widget" in sharedOptions && !sharedOptions.widget) { continue; } // Skip
					propertiesValues[i] = CloneInsides(sharedOptions);
				}
				else if (instance["@" + i]) // Guess from instance info
				{
					propertiesValues[i] = instance["@" + i];
				}
				else if (i === null || i === undefined) // Are you sure?
				{
					continue;
				}
				else
				{
					switch (typeof value)
					{
					case 'number': propertiesValues[i] = { type: "number", step: 0.1 } as GenericCreationOptions; break;
					case 'string': propertiesValues[i] = { type: "string" }; break;
					case 'boolean': propertiesValues[i] = { type: "boolean" }; break;
					default:
						if (value && Array.isArray(value)) // Array or typed_array
						{
							const isNumber = (value[0] && typeof value[0] === "number");
							switch ((value as Array<unknown>).length)
							{
							case 2: propertiesValues[i] = { type: isNumber ? "vec2" : "array", step: 0.1 } as GenericCreationOptions; break;
							case 3: propertiesValues[i] = { type: isNumber ? "vec3" : "array", step: 0.1 } as GenericCreationOptions; break;
							case 4: propertiesValues[i] = { type: isNumber ? "vec4" : "array", step: 0.1 } as GenericCreationOptions; break;
							default:
								propertiesValues[i] = { type: "array" };
								break;
							}
						}
					}
				}
			}
		}

		if (skipProperties)
		{
			for (const i in skipProperties)
			{
				propertiesValues[skipProperties[i] as keyof typeof propertiesValues] = undefined;
			}
		}

		// Allows to establish the order of the properties in the inspector
		if (classObject && "properties_order" in classObject)
		{
			const propertiesOrder = classObject.properties_order as string[];
			const sortedProperties: Record<string, unknown> = {};
			for (const i in propertiesOrder)
			{
				const name = propertiesOrder[i];
				if (propertiesValues[name])
				{
					sortedProperties[name] = propertiesValues[name];
				}
				else
				{
					console.warn("property not found in instance:", name);
				}
			}
			for (const i in propertiesValues) // Add the missing ones at the end (should this be optional?)
			{
				if (!sortedProperties[i])
				{
					sortedProperties[i] = propertiesValues[i];
				}
			}
			propertiesValues = sortedProperties;
		}


		// ShowAttributes doesn't return anything but just in case...
		return this.showProperties(instance, propertiesValues as Record<string, GenericCreationOptions | undefined>);
	}

	/**
	 * Adds the widgets for the properties specified in the info of instance, it will create callback and onUpdate.
	 * @param {any} instance The instance that you want to inspect.
	 * @param {{[key:string]:GenericCreationOptions|undefined}} info Object containing "property name" :{ type: value, widget:..., min:..., max:... } or just "property":"type".
	 * @param {string[]} [skipProperties] These properties will be ignored.
	 */
	showProperties(instance: Record<string, unknown>, info: { [key: string]: GenericCreationOptions | undefined }, skipProperties?: string[])
	{
		// For every enumerable property create widget
		for (const i in info)
		{
			let varname = i;
			if (skipProperties && skipProperties.includes(varname))
			{
				continue;
			}
			if (!info[i])
			{
				continue;
			}
			const options: PropertyOptions = info[i]!;

			if (options.name)
			{
				options.varname = i;
				varname = options.name;
				if (skipProperties && skipProperties.includes(varname))
				{
					continue;
				}
			}
			if (!options.callback) // Generate default callback to modify data
			{
				const o: InstanceHolder = { instance: instance, name: varname, options: options as Record<string, unknown> };
				if (options.type != "function") { options.callback = AssignValue.bind(o) as (v?: unknown, e?: Event) => void; }
			}
			if (!options.onUpdate) // Generate default refresh
			{
				const o: InstanceHolder = { instance: instance, name: varname };
				options.onUpdate = function ()
				{
					return o.instance[o.name];
				};
			}

			options.instance = instance;

			const type = (options.widget as string) || options.type || "string";

			// Used to hook stuff on special occasions
			if (this.onAddProperty)
			{
				this.onAddProperty(type, instance, varname, instance[varname], options);
			}
			this.add(type, varname, instance[varname] as InspectorValue, options);
		}

		// Extra widgets inserted by the object (stored in the constructor)
		if ("widgets" in instance.constructor)
		{
			const widgets = instance.constructor.widgets as Record<string, unknown>;
			for (const i in widgets)
			{
				const w = widgets[i] as Record<string, unknown>;
				this.add(w.widget as string, w.name as string, w.value as InspectorValue, w as PropertyOptions);
			}
		}

		// Used to add extra widgets at the end
		if ("onShowProperties" in instance && typeof instance.onShowProperties === "function")
		{
			instance.onShowProperties(this);
		}
		if ("onShowProperties" in instance.constructor &&
			typeof instance.constructor.onShowProperties === "function")
		{
			instance.constructor.onShowProperties(instance, this);
		}
	}

	/**
	 * Used by all widgets to create the container of one widget.
	 * @param {string} [name] The string to show at the left side of the widget, if null this element wont be created and the value part will use the full width.
	 * @param {string | number | boolean | HTMLElement} [content] The string with the html of the elements that conform the interactive part of the widget.
	 * @param {CreateWidgetOptions} [options] Some generic options that any widget could have:
	 * - widgetName: the name used to store this widget in the widgetsByName container, if omitted the parameter name is used
	 * - width: the width of the widget (if omitted it will use the Inspector widgetsWidth, otherwise 100%
	 * - nameWidth: the width of the name part of the widget, if not specified it will use Inspector nameWidth, otherwise css default
	 * - contentWidth: the width of the widget content area
	 * - preTitle: string to append to the left side of the name, this is helpful if you want to add icons with behaviour when clicked
	 * - title: string or string[] to replace the name, sometimes you want to supply a different name than the one you want to show (this is helpful to retrieve values from an inspector)
	 * @returns {InspectorWidget} The created widget element.
	 */
	createWidget(name?: string, content?: string | number | boolean | HTMLElement,
		options?: CreateWidgetOptions): InspectorWidget
	{
		options = options ?? {};
		content = content ?? "";
		const element = document.createElement("DIV") as InspectorWidget;
		element.className = "widget " + (options.className ?? "");
		element.inspector = this;
		element.options = options;
		element.name = (typeof name === "string" && !name.includes("_EMPTY_")) ? name : undefined;

		this.rowNumber += this.widgetsPerRow;
		if (this.rowNumber % 2 == 0) { element.className += " even"; }

		const width = options.width ?? this.widgetsWidth;
		if (width)
		{
			const cssWidth = SizeToCSS(width);
			if (cssWidth)
			{
				element.style.width = cssWidth.toString();
			}
			else
			{
				element.style.width = `calc(${SizeToCSS(width)})`;
			}
			element.style.minWidth = "auto";
		}
		const height = options.height ?? this.height;
		if (height)
		{
			const cssHeight = SizeToCSS(height);
			if (cssHeight)
			{
				element.style.height = cssHeight.toString();
			}
			else
			{
				element.style.height = `calc(${SizeToCSS(height)})`;
			}
			element.style.minHeight = "auto";
		}

		// Store widgets
		this.widgets.push(element);
		if (options.widgetName || name)
		{
			this.widgetsByName.set(options.widgetName ?? name ?? '', element);
		}

		if (this.widgetsPerRow != 1)
		{
			if (!options.width) { element.style.width = (100 / this.widgetsPerRow).toFixed(2) + "%"; }
			element.style.display = "inline-block";
		}

		let nameWidth = "";
		let contentWidth = "";
		if ((name !== undefined && name !== null) && (this.nameWidth || options.nameWidth) && !this.oneLine)
		{
			const w = SizeToCSS(options.nameWidth ?? this.nameWidth ?? undefined);
			nameWidth = `style='width: calc(${w} - 0px); width: -webkit-calc(${w} - 0px); width: -moz-calc(${w} - 0px); '`; // Hack
			contentWidth = `style='width: calc( 100% - ${w}); width: -webkit-calc(100% - ${w}); width: -moz-calc( 100% - ${w}); '`;
		}

		if (options.nameWidth) { nameWidth = `style='width: ${SizeToCSS(options.nameWidth)} '`; }
		if (options.contentWidth) { contentWidth = `style='width: ${SizeToCSS(options.contentWidth)} '`; }

		let code = "";
		let content_class = "wcontent ";
		if (name === null || name === undefined)
		{
			content_class += " full";
		}
		else
		{
			let preTitle = "";
			if (options.preTitle) { preTitle = options.preTitle; }

			let title: string | string[] = name;
			if (options.title) { title = options.title; }

			const filling = this.oneLine ? "" : "<span class='filling'></span>";
			if (name === "")
			{
				code += `<span class='wname' title='${title}' ${nameWidth}>${preTitle}</span>`;
			}
			else
			{
				code += `<span class='wname' title='${title}' ${nameWidth}>${preTitle}${name}${filling}</span>`;
			}
		}

		const contentType = typeof content;
		switch (contentType)
		{
		case "string":
		case "number":
		case "boolean":
			element.innerHTML = `${code}<span class='info_content ${content_class}' ${contentWidth}>${content}</span>`;
			break;
		default:
		{
			element.innerHTML = `${code}<span class='info_content ${content_class}' ${contentWidth}></span>`;
			const contentElement = element.querySelector("span.info_content");
			if (contentElement) { contentElement.appendChild(content as HTMLElement); }
			break;
		}
		}

		element.content = element.querySelector<HTMLElement>("span.info_content") ?? undefined;
		element.remove = function ()
		{
			if (this.parentNode) { this.parentNode.removeChild(this); }
		};

		return element;
	}

	/**
	 * Internal method called when a widget's value changes.
	 * Handles callbacks, events, and value updates.
	 * @param {InspectorWidget} element The widget element.
	 * @param {string} name The name of the value/widget.
	 * @param {InspectorValue} value The new value.
	 * @param {WidgetChangeOptions} options Options containing callbacks.
	 * @param {boolean} [expand_value] If true and value is array, spreads arguments applied to callback.
	 * @param {Event} [event] The original event that triggered the change.
	 * @returns {any} The result of the callback.
	 */
	onWidgetChange(element: InspectorWidget, name: string, value: InspectorValue, options: WidgetChangeOptions, expand_value?: boolean, event?: Event)
	{
		const section = element.section; // This.current_section

		if (!options.skipWChange)
		{
			if (section) { Trigger(section, "wbeforechange", value); }
			Trigger(element, "wbeforechange", value);
		}

		// Assign and launch callbacks
		this.values.set(name, value);
		let r = undefined;
		if (options.callback)
		{
			if (expand_value && Array.isArray(value))
			{
				const callback = options.callback as (...args: InspectorValue[]) => void;
				r = callback.apply(element, value);
			}
			else
			{
				const callback = options.callback as (value: InspectorValue, e?: Event) => void;
				r = callback.call(element, value, event);
			}
		}

		if (!options.skipWChange)
		{
			if (section) { Trigger(section, "wchange", value); }
			Trigger(element, "wchange", value);
		}

		if (this.onChange) { this.onChange(name, value, element); }
		return r;
	}

	/**
	 * Resolves the proper name for a value/widget, generating a unique one if missing.
	 * @param {string} [widgetName] The proposed name.
	 * @param {GenericCreationOptions} [options] Options potentially containing a widget_name.
	 * @returns {string} The resolved name.
	 */
	getValueName(widgetName?: string, options?: GenericCreationOptions): string
	{
		options = options ?? {};
		if (widgetName === undefined && options.widgetName === undefined)
		{
			widgetName = `_EMPTY_NAME_WIDGET_${this.emptyWidgetIndex++}`;
		}
		return widgetName ?? options.widgetName!;
	}

	/**
	 * Registry of available widget constructors.
	 * Maps widget type strings to function names or instances.
	 */
	public static widgetConstructors: {
        [key: string]: string |
        ((name?: string, value?: InspectorValue, options?: CreateWidgetOptions) => InspectorWidget)
    } =
			{
				"null": 'doNothing',
				"undefined": 'doNothing',
				title: 'addTitle',
			};

	/**
	 * Registers a new custom widget type.
	 * @param {string} name The type name of the widget.
	 * @param {string | Function} constructor The constructor function or method name.
	 */
	public static registerWidget(name: string, constructor: string |
        ((name?: string, value?: InspectorValue, options?: CreateWidgetOptions) => InspectorWidget))
	{
		Inspector.widgetConstructors[name.toLowerCase()] = constructor;
	}

	/**
	 * Unregisters a widget type.
	 * @param {string} name The type name of the widget to unregister.
	 */
	public static unregisterWidget(name: string)
	{
		if (Inspector.widgetConstructors[name.toLowerCase()])
		{
			delete Inspector.widgetConstructors[name.toLowerCase()];
		}
	}

	/**
	 * Adds a widget to the inspector, its a way to provide the widget type from a string.
	 * @param {InspectorWidgetTypes | string} [type] String specifying the name of the widget to use (check Inspector.widget_constructors for a complete list).
	 * @param {string} [name] The string to show at the left side of the widget, if null this element wont be created and the value part will use the full width.
	 * @param {InspectorValue} [value] The value to assign to the widget.
	 * @param {GenericCreationOptions} [options] Some generic options that any widget could have:
	 * - type: overwrites the type
	 * - callback: function to call when the user interacts with the widget and changes the value
	 * [For a bigger list check createWidget and every widget in particular]
	 * @returns {InspectorWidget | undefined} The widget in the form of the DOM element that contains it.
	 */
	add(type?: InspectorWidgetTypes | string, name?: string, value?: InspectorValue, options?: GenericCreationOptions): InspectorWidget | undefined
	{
		options = options ?? {};
		if (options.type) { type = options.type; }
		if (options.name) { name = options.name; }
		if (options.value) { value = options.value; }

		let func: string | ((name?: string, value?: InspectorValue, options?: CreateWidgetOptions) => InspectorWidget) | undefined =
            Inspector.widgetConstructors[type?.toLowerCase() ?? 'null'];
		if (!func)
		{
			console.warn("LiteGUI.Inspector: Widget not found: " + type);
			return;
		}

		if (typeof func === 'string')
		{
			const protoMethod = Inspector.prototype[func as keyof Inspector] as ((name?: string, value?: InspectorValue, options?: CreateWidgetOptions) => InspectorWidget) | undefined;
			if (!protoMethod)
			{
				console.warn("LiteGUI.Inspector: Widget method not found:", func);
				return;
			}
			func = protoMethod;
		}

		if (typeof (func) !== 'function')
		{
			console.warn("LiteGUI.Inspector: Widget method not found or not a function:", type, func);
			return;
		}
		else if (typeof (func) === 'function')
		{
			return func.call(this, name, value, options);
		}

		return undefined;
	}


	/**
	 * Retrieves the value of a specific widget by name.
	 * @param {string} name The name of the widget.
	 * @returns {InspectorValue} The value of the widget.
	 */
	getValue(name: string): InspectorValue
	{
		return this.values.get(name);
	}

	/**
	 * Applies standard options (id, classes, style) to a container element.
	 * @param {HTMLDivElement} element The DOM element to modify.
	 * @param {HTMLDivElementOptions} options The options containing id, className, width, height, etc.
	 */
	applyOptions(element: HTMLDivElement, options: HTMLDivElementOptions)
	{
		if (!element || !options) { return; }

		if (options.className) { element.className += " " + options.className; }
		if (options.id) { element.id = options.id; }
		if (options.width) { element.style.width = SizeToCSS(options.width) ?? '0px'; }
		if (options.height) { element.style.height = SizeToCSS(options.height) ?? '0px'; }
	}

	/**
	 * Helper method that does nothing. Used as a placeholder for invalid widget types.
	 * @private
	 * @returns {undefined} Always returns undefined.
	 */
	private _doNothing()
	{
		return undefined;
	}

	//* **** Containers ********/
	/**
	 * Creates an empty container but does not set it as the active stack container.
	 * @param {AddContainerOptions} [options] Configuration options.
	 * @returns {InspectorContainer} The created container element.
	 */
	addEmptyContainer(options?: AddContainerOptions)
	{
		options = options ?? {};
		const element = this.startContainer(options);
		this.endContainer();
		return element;
	}

	/**
	 * Creates a new container and sets it as the active container for subsequent widgets.
	 * @param {AddContainerOptions} options Configuration options.
	 * @returns {InspectorContainer} The created container element.
	 */
	startContainer(options: AddContainerOptions)
	{
		const element = document.createElement("DIV") as InspectorContainer;
		element.className = "wcontainer";
		this.applyOptions(element, options);
		this.rowNumber = 0;

		this.appendWidget(element);
		this.pushContainer(element);

		if (options.widgetPerRow)
		{
			this.widgetsPerRow = options.widgetPerRow;
		}

		if (options.height)
		{
			element.style.height = SizeToCSS(options.height) ?? '0px';
			element.style.overflow = "auto";
		}

		element.refresh = function ()
		{
			if (element.onRefresh) { element.onRefresh.call(this, element); }
		};

		return element;
	}

	/**
	 * Closes the current container and pops it from the stack.
	 */
	endContainer()
	{
		this.popContainer();
	}

	/**
	 * Adds a collapsible section to the inspector. Sections cannot be nested inside containers, but they contain a container.
	 * @param {string} [name] Title of the section.
	 * @param {InspectorOptions} [options] Configuration options for the section.
	 * @returns {InspectorSection} The created section element.
	 */
	addSection(name?: string, options?: InspectorOptions): InspectorSection
	{
		if (options == undefined) { options = {}; }
		if (this.currentSection) { this.currentSection.end(); }

		const element = document.createElement("DIV") as InspectorSection;
		element.className = "wsection";
		if (!name) { element.className += " notitle"; }
		if (options.className)
		{
			element.className += " " + options.className;
		}
		if (options.collapsed && !options.noCollapse)
		{
			element.className += " collapsed";
		}

		if (options.id)
		{
			element.id = options.id ?? "";
		}
		if (options.instance)
		{
			element.instance = options.instance ?? {};
		}

		let code = "";
		if (name)
		{
			code += `<div class='wsectiontitle'>${options.noCollapse ? "" :
				"<span class='switch-section-button'></span>"}${name}</div>`;
		}
		code += "<div class='wsectioncontent'></div>";
		element.innerHTML = code;

		// Append to inspector
		element.lastContainerStack = this._currentContainerStack.concat();
		// This.appendWidget( element ); //sections are added to the root, not to the current container
		this.root.appendChild(element);
		this.sections.push(element);

		element.sectionTitle = element.querySelector(".wsectiontitle")!;

		if (name && !options.noCollapse)
		{
			element.sectionTitle?.addEventListener("click", (e: Event) =>
			{
				if ((e.target as HTMLElement).localName == "button") { return; }
				element.classList.toggle("collapsed");
				const seccont: HTMLElement = element.querySelector(".wsectioncontent")!;
				seccont.style.display = seccont.style.display === "none" ? "" : "none";
				if (options.callback)
				{
					options.callback.call(element, element.classList.contains("collapsed"));
				}
			});
		}

		if (options.collapsed && !options.noCollapse)
		{
			const seccont: HTMLElement = element.querySelector(".wsectioncontent")!;
			seccont.style.display = "none";
		}

		this.setCurrentSection(element);

		if (options.widgetsPerRow)
		{
			this.widgetsPerRow = options.widgetsPerRow;
		}

		element.refresh = function ()
		{
			if (element.onRefresh)
			{
				element.onRefresh.call(this, element);
			}
		};

		element.end = () =>
		{
			if (this.currentSection != element) { return; }

			this._currentContainerStack = element.lastContainerStack!;
			this._currentContainer = undefined;

			const content = element.querySelector(".wsectioncontent") as InspectorContainer;
			if (!content) { return; }
			if (this.isContainerInStack(content)) { this.popContainer(content); }
			this.currentSection = undefined;
		};

		return element;
	}

	/**
	 * Changes the current active section to the specified one.
	 * @param {InspectorSection} section The section to make active.
	 */
	setCurrentSection(section: InspectorSection)
	{
		if (this.currentSection == section) { return; }

		this.currentSection = section;

		const parent = section.parentNode as HTMLElement;
		if (!parent) { return; }
		this.popContainer(parent); // Go back till that container

		const content = section.querySelector(".wsectioncontent") as InspectorContainer;
		if (!content) { return; }
		this.pushContainer(content);
	}

	/**
	 * Retrieves the currently active section.
	 * @returns {HTMLElement | null} The section element or null if no section is active.
	 */
	getCurrentSection()
	{
		for (let i = this._currentContainerStack.length - 1; i >= 0; --i)
		{
			const container = this._currentContainerStack[i];
			if (container.classList.contains("wsectioncontent"))
			{ return container.parentNode; }
		}
		return null;
	}

	/**
	 * Ends the current section, popping it from the stack.
	 */
	endCurrentSection()
	{
		if (this.currentSection) { this.currentSection.end(); }
	}

	/**
	 * Begins a new group of widgets. Groups provide a visual grouping and can be collapsed.
	 * @param {string} [name] The title of the group.
	 * @param {BeginGroupOptions} [options] Configuration options.
	 * @returns {InspectorGroupWidget} The group element.
	 */
	beginGroup(name?: string, options?: BeginGroupOptions)
	{
		const element = document.createElement("DIV") as InspectorGroupWidget;
		element.className = "wgroup";
		name = name ?? "";
		options = options ?? {};
		element.innerHTML = `<div class='wgroupheader ${options.title ? "wtitle" : ""}'><span class='switch-section-button'></span>${name}</div>`;
		element.group = true;

		const content = document.createElement("DIV") as InspectorContainer;
		content.className = "wgroupcontent";
		if (options.collapsed) { content.style.display = "none"; }

		if (options.height) { content.style.height = SizeToCSS(options.height)!; }
		if (options.scrollable) { content.style.overflow = "auto"; }

		element.appendChild(content);

		let collapsed = options.collapsed ?? false;
		const header = element.querySelector(".wgroupheader") as HTMLElement;
		if (!header) { throw new Error("Header not found"); }
		if (collapsed) { header.classList.add("collapsed"); }
		header.addEventListener("click", (e: Event) =>
		{
			const style = (element.querySelector(".wgroupcontent") as HTMLElement).style;
			style.display = style.display === "none" ? "" : "none";
			collapsed = !collapsed;
			if (collapsed)
			{
                header!.classList.add("collapsed");
			}
			else
			{
                header!.classList.remove("collapsed");
			}
			e.preventDefault();
		});

		this.appendWidget(element, options);
		this.pushContainer(content);
		return element;
	}

	/**
	 * Ends the current group, popping it from the stack.
	 */
	endGroup()
	{
		do
		{
			this.popContainer();
		}
		while (this._currentContainer && !this._currentContainer.classList.contains("wgroupcontent"));
	}

	/**
	 * Creates a title bar in the widgets list to help separate widgets.
	 * @param {string} title The text to display in the title.
	 * @param {AddTitleOptions} [options] Configuration options.
	 * @returns {HTMLDivElement} The title widget element.
	 */
	addTitle(title: string, options?: AddTitleOptions)
	{
		options = this.processOptions(options);
		const element = document.createElement("DIV") as InspectorWidget;
		let code = `<span class='wtitle'><span class='text'>${title}</span>`;
		if (options.help)
		{
			code += `<span class='help'><div class='help-content'>${options.help}</div></span>`;
		}
		code += "</span>";
		element.innerHTML = code;
		element.setValue = function (v: InspectorValue)
		{
			if (typeof v !== 'string') { return; }
			const tempo = this.querySelector(".text");
			if (tempo) {tempo.innerHTML = v;}
		};
		this.rowNumber = 0;
		this.appendWidget(element, options);
		return element;
	}

	/**
	 * Scrolls the inspector to show the element with the specified ID.
	 * @param {string} id The ID of the element to scroll to.
	 */
	scrollTo(id: string)
	{
		const element = this.root.querySelector(`#${id}`) as HTMLElement;
		if (!element) { return; }
		const top = this.root.offsetTop;
		const delta = element.offsetTop - top;
		if (!this.root.parentNode?.parentNode) { return; }
		(this.root.parentNode.parentNode as HTMLElement).scrollTop = delta;
	}

	/**
	 * Processes options, ensuring they are in an object format.
	 * @param {Record<string, unknown> | (...args: unknown[]) => unknown} options The options to process.
	 * @returns {Record<string, unknown>} The processed options object.
	 */
	processOptions(options?: object | ((...args: unknown[]) => unknown)): object
	{
		return typeof options === 'function' ? { callback: options } : options ?? {};
	}

	/**
	 * Processes a widget element, applying update hooks if provided.
	 * @param {InspectorWidget} element The widget element.
	 * @param {ProcessElementOptions} options Options containing update hooks.
	 */
	processElement(element: InspectorWidget, options: ProcessElementOptions)
	{
		if (options.onUpdate && element.setValue)
		{
			element.onWidgetUpdate = function ()
			{
                element.setValue!(options.onUpdate?.call(element) as InspectorValue, true);
			};
		}
	}

	/**
	 * Updates all widgets that have an onWidgetUpdate hook.
	 */
	updateWidgets()
	{
		for (let i = 0; i < this.widgets.length; ++i)
		{
			const widget = this.widgets[i];
			if (widget.onWidgetUpdate) { widget.onWidgetUpdate(widget); }
		}
	}

	/**
	 * Helper to parse a color array into a styled HTML string.
	 * @param {[number, number, number, number]} color The color array [r, g, b, a].
	 * @returns {string} The styled HTML string representing the color.
	 */
	public static parseColor(color: [number, number, number, number])
	{
		return "<span style='color: #FAAAA'>" + color[0].toFixed(2) +
            "</span>,<span style='color: #AFAAA'>" + color[1].toFixed(2) +
            "</span>,<span style='color: #AAFAA'>" + color[2].toFixed(2) +
            "</span>,<span style='color: #AAAAF'>" + color[3].toFixed(2) + "</span>";
	}
}