import { SizeToCSS } from "../utilities";
import { CreateWidgetOptions, InspectorActiveWidget, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { Inspector } from "./inspector";


/**
 * Options for creating an Info widget.
 */
export interface AddInfoOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * Callback function to execute when the widget is clicked.
	 */
	callback?: () => void;
}

/**
 * Interface representing the Info widget, which displays non-interactive HTML content.
 */
export interface InspectorInfoWidget extends InspectorActiveWidget
{
	/**
	 * Appends a node to the content area of the info widget.
	 * @param {Node} e The node to append.
	 */
	add: (e: Node) => void;

	/**
	 * Updates the HTML content of the info widget.
	 * @param {string} [value] The new HTML string to display.
	 */
	setValue: (value?: InspectorValue) => void;

	/**
	 * Scrolls the content area to the bottom.
	 */
	scrollToBottom: () => void;
}

/**
 * Widget to show plain information in HTML (not interactive).
 * @function AddInfo
 *
 * @param {Inspector} that The inspector instance.
 * @param {string} [name] The label name for the widget.
 * @param {string} [value] The HTML content to display.
 * @param {AddInfoOptions} [options] Configuration options.
 * @returns {InspectorInfoWidget} The created widget element.
 */
export function AddInfo(that: Inspector, name?: string, value?: string, options?: AddInfoOptions): InspectorInfoWidget
{
	value = value ?? '';
	options = options ?? {};

	// Get unique identifier for the value and store it
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	let element: InspectorInfoWidget | undefined = undefined;

	// Create widget structure based on whether it has a label
	if (name !== undefined)
	{
		element = that.createWidget(name, value, options) as InspectorInfoWidget;
	}
	else
	{
		element = document.createElement("div") as InspectorInfoWidget;
		if (options.className) { element.className = options.className; }

		element.innerHTML = `<span class='winfo'>${value}</span>`;
	}

	const info: HTMLElement = element.querySelector(".winfo") ??
		element.querySelector(".wcontent") as HTMLElement;

	if (options.callback) { element.addEventListener("click", options.callback.bind(element)); }

	// Method to update the displayed value and internal state
	element.setValue = function (v?: InspectorValue)
	{
		if (v === undefined || (typeof v !== 'string' && typeof v !== 'number' && typeof v !== 'boolean')) { return; }
		const strVal = v.toString();
		if (info) { info.innerHTML = strVal; }
		that.values.set(valueName, v);
	};

	let content = element.querySelector("span.info_content") as HTMLElement;
	if (!content) { content = element.querySelector(".winfo") as HTMLElement; }
	element.content = content;

	// Apply custom width if specified
	if (options.width)
	{
		element.style.width = SizeToCSS(options.width) ?? '0';
		element.style.display = "inline-block";
		if (!name) { info.style.margin = "2px"; }
	}

	// Apply custom height if specified
	if (options.height)
	{
		content.style.height = SizeToCSS(options.height) ?? '0';
		content.style.overflow = "auto";
	}

	element.scrollToBottom = function ()
	{
		content.scrollTop = content.offsetTop;
	};

	element.add = function (e: Node)
	{
		content.appendChild(e);
	};

	element.getValue = function ()
	{
		return that.values.get(valueName);
	};

	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addInfo(name?: string, value?: string, options?: AddInfoOptions): InspectorInfoWidget;
	}
}

Inspector.prototype.addInfo = function (name?: string, value?: string, options?: AddInfoOptions): InspectorInfoWidget
{
	return AddInfo(this, name, value, options);
};

Inspector.widgetConstructors.info = "addInfo";