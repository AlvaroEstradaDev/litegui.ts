import { LiteGUI } from "../core";
import { CreateWidgetOptions, InspectorActiveWidget, InspectorValue, InspectorWidget, WidgetChangeOptions } from "../@types/Inspector";
import { Inspector } from "./inspector";

/**
 * Options for creating a Combo widget.
 */
export interface AddComboOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * List of values to be displayed in the dropdown or as buttons.
	 */
	values?: string[];

	/**
	 * Whether the widget is disabled.
	 */
	disabled?: boolean;

	/**
	 * Callback function triggered when the value changes.
	 */
	callback?: (value: string) => void;
}

/**
 * Interface for the Combo widget element.
 */
export interface InspectorComboWidget extends InspectorActiveWidget
{
	/**
	 * Updates the values of the dropdown options.
	 * @param {string[]} values Array of string values for the options.
	 * @param {string} [selected] Optional value to be selected.
	 */
	setOptionValues: (values: string[], selected?: string) => void;

	/**
	 * Sets the selected value of the combo box.
	 * @param {string} value The value to select.
	 * @param {boolean} [skipEvent] Whether to skip triggering the change event.
	 */
	setValue: (value: InspectorValue, skipEvent?: boolean) => void;
}

/**
 * Interface for the Combo Buttons widget element.
 */
export interface InspectorComboButtonsWidget extends InspectorWidget
{
	/**
	 * List of button elements contained in the widget.
	 */
	buttons: NodeListOf<HTMLButtonElement>;
}

/**
 * Adds a dropdown combo widget to the Inspector.
 * @function AddCombo
 * @param {Inspector} that - The Inspector instance.
 * @param {string} [name] - The name/label of the widget.
 * @param {string} [value=''] - The initial selected value.
 * @param {AddComboOptions} [options] - Configuration options.
 * @param {string[]} [options.values] - List of values (strings) to populate the dropdown.
 * @param {boolean} [options.disabled] - If true, the widget is disabled.
 * @param {Function} [options.callback] - Function to call on change.
 * @returns {InspectorComboWidget} The created combo widget.
 */
export function AddCombo(that: Inspector, name?: string, value?: string, options?: AddComboOptions): InspectorComboWidget
{
	value = value ?? '';
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	// Increment tabindex for accessibility
	that.tabIndex++;

	const isDisabledText = options.disabled ? "disabled" : "";
	const element = that.createWidget(name, "<span class='inputfield full inputcombo " +
		isDisabledText + "'></span>", options) as InspectorComboWidget;
	element.options = options;

	let values: string[] = options.values ?? [];

	// Create inner structure
	const code = "<select tabIndex='" + that.tabIndex + "' " + isDisabledText + " class='" + isDisabledText + "'></select>";
	element.querySelector("span.inputcombo")!.innerHTML = code;
	setValues(values);

	let _stopEvent = false; // Used internally

	// Event listener for change
	const select = element.querySelector(".wcontent select") as HTMLSelectElement;
	select.addEventListener("change", (e: Event) =>
	{
		const v = (e.target as HTMLSelectElement).value;
		value = v;
		if (_stopEvent) { return; }
		that.onWidgetChange(element, valueName, value, options as unknown as WidgetChangeOptions);
	});

	element.getValue = function ()
	{
		return value;
	};

	element.setValue = function (v: InspectorValue, skipEvent?: boolean)
	{
		if (v === undefined || typeof v !== 'string') { return; }
		value = v;
		const select = element.querySelector("select") as HTMLSelectElement;
		const items = select.querySelectorAll("option");
		const index = values.indexOf(v) ?? -1;
		if (index == -1) { return; }

		_stopEvent = skipEvent ?? false;

		// Update DOM elements to reflect value
		for (const i in items)
		{
			const item = items[i];
			if (!item || !item.dataset) { continue; }
			const setIndex = item.dataset['index'];
			if (setIndex && parseFloat(setIndex) == index)
			{
				item.selected = true;
				select.selectedIndex = index;
			}
			else
			{
				item.removeAttribute("selected");
			}
		}

		_stopEvent = false;
	};

	function setValues(v: string[], selected?: string)
	{
		values = v;
		if (selected) { value = selected; }
		let code = "";
		for (const i in values)
		{
			code += "<option value='" + i + "' " + (values[i] == value ? " selected" : "") + " data-index='" + i + "'>" + values[i] + "</option>";
		}
		element.querySelector("select")!.innerHTML = code;
	}

	element.setOptionValues = setValues;

	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
}

/**
 * Adds a widget with an array of buttons, where clicking one selects it.
 * @function AddComboButtons
 * @param {Inspector} that - The Inspector instance.
 * @param {string} [name] - The name/label of the widget.
 * @param {string} [value=''] - The initial selected value.
 * @param {AddComboOptions} [options] - Configuration options.
 * @param {string[]} [options.values] - List of values for the buttons.
 * @returns {InspectorComboButtonsWidget} The created combo buttons widget.
 */
export function AddComboButtons(that: Inspector, name?: string, value?: string, options?: AddComboOptions): InspectorComboButtonsWidget
{
	value = value ?? '';
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	let code = "";
	if (options.values)
	{
		for (const i in options.values)
		{
			code += `<button class='wcombobutton ${value == options.values[i] ? "selected" : ""}' data-name='${options.values[i]}'>${options.values[i]}</button>`;
		}
	}

	// Generate buttons for each value
	const element = that.createWidget(name, code, options) as InspectorComboButtonsWidget;
	const buttons = element.querySelectorAll(".wcontent button") as NodeListOf<HTMLButtonElement>;
	element.buttons = buttons;

	// Bind click events
	LiteGUI.bind(buttons, "click", (e: Event) =>
	{
		const el = e.target as HTMLElement;
		const buttonName = el.innerHTML;
		that.values.set(valueName, buttonName);

		const elements = element.querySelectorAll(".selected");
		for (let i = 0; i < elements.length; ++i)
		{
			elements[i].classList.remove("selected");
		}
		el.classList.add("selected");

		that.onWidgetChange(element, valueName, buttonName, options as unknown as WidgetChangeOptions);
	});

	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addCombo(name?: string, value?: string, options?: AddComboOptions): InspectorComboWidget;
		addComboButtons(name?: string, value?: string, options?: AddComboOptions): InspectorComboButtonsWidget;
	}
}

Inspector.prototype.addCombo = function (name?: string, value?: string, options?: AddComboOptions): InspectorComboWidget
{
	return AddCombo(this, name, value, options);
};

Inspector.prototype.addComboButtons = function (name?: string, value?: string, options?: AddComboOptions): InspectorComboButtonsWidget
{
	return AddComboButtons(this, name, value, options);
};

Inspector.widgetConstructors.combo = "addCombo";
Inspector.widgetConstructors.enum = "addCombo";
Inspector.widgetConstructors.dropdown = "addCombo";
Inspector.widgetConstructors.combobuttons = "addComboButtons";

