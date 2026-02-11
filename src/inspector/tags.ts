import { Trigger } from "../utilities";
import { CreateWidgetOptions, InspectorWidget, WidgetChangeOptions } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "./inspector";

/**
 * Options for creating an InspectorTags widget.
 */
export interface AddTagOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * If true, the widget will be disabled and non-interactive.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Callback function triggered when the tags state changes.
	 * The value parameter contains a map of tag names to their active state (true/false).
	 */
	callback?: (value: { [key: string]: boolean }) => void;
}

/**
 * Interface representing the Tags widget structure.
 */
export interface InspectorTagsWidget extends InspectorWidget
{
	/**
	 * Map of current tags and their active state (true = active/selected, false = inactive).
	 */
	tags: { [key: string]: boolean };
}

/**
 * Internal interface for the tag DOM element.
 */
interface TagElement extends HTMLDivElement
{
	/**
	 * The name of the tag associated with this element.
	 */
	data: string;
}

/**
 * Adds a "Tags" widget to the Inspector.
 *
 * This widget manages a list of tags that can be toggled or removed.
 * - **Active Tags**: Displayed in a brighter color (value stored as `true`).
 * - **Inactive Tags**: Displayed in a darker color (value stored as `false`).
 * - **Adding**: Users can type a new tag name and press Enter to add it.
 * - **Removing**: Each tag has a closing 'X' button to remove it from the list.
 * @function AddTags
 *
 * @param {Inspector} that The Inspector instance to attach this widget to.
 * @param {string} [name] The label/name for the widget, used for internal state management.
 * @param {string[]} [values] Initial list of tag names to populate the widget with.
 * @param {AddTagOptions} [options] Configuration options for the widget (see `AddTagOptions`).
 * @returns {InspectorTagsWidget} The created widget HTML element.
 */
export function AddTags(that: Inspector, name?: string, values?: string[], options?: AddTagOptions)
{
	// Normalize options and defaults
	values = values ?? [];
	options = options ?? {};

	// Determine the property name to bind to
	const valueName = that.getValueName(name, options);

	// Initialize the internal value for this widget in the inspector
	that.values.set(valueName, {});

	// Create the HTML structure: input field and a container for tag elements
	const code = "<input type='text' class='wtaginput inputfield' placeholder='Add tag...'/>" +
		"<div class='wtagscontainer'></div>";

	// Create the main widget element leveraging the Inspector's helper
	const element = that.createWidget(name, `<div class='wtagswrapper'>${code}</div>`, options) as InspectorTagsWidget;
	element.tags = {};

	// Cache references to the DOM elements
	const container = element.querySelector(".wtagscontainer") as HTMLElement;
	const input = element.querySelector(".wtaginput") as HTMLInputElement;

	// Event listener: Add tag when user presses 'Enter' in the input field
	input.addEventListener("keydown", (e) =>
	{
		if (e.key === "Enter")
		{
			e.preventDefault();
			e.stopPropagation();
			if (input.value)
			{
				_onAddTag(input.value);
				input.value = ""; // Clear input after adding
			}
		}
	});

	// Populate widget with initial values
	if (values)
	{
		for (const i in values)
		{
			_onAddTag(values[i]);
		}
	}

	/**
	 * Internal helper to create and append a single tag element.
	 * @param {string} tagname Name of the tag to add.
	 */
	function _onAddTag(tagname: string)
	{
		// Prevent duplicate tags
		if (element.tags[tagname] !== undefined) { return; }

		// Register the new tag as active by default
		element.tags[tagname] = true;

		// Create the DOM element for the tag
		const tag = document.createElement("div") as TagElement;
		tag.data = tagname;
		tag.className = "wtag";
		tag.innerHTML = `${tagname}<span class='close'>X</span>`;

		// Event listener: Toggle active state on click (unless clicking 'close')
		tag.addEventListener("click", (e: MouseEvent) =>
		{
			/*
			 * Specific check for the close button is handled in its own listener below,
			 * but we ensure we don't process it here if bubbling reaches this far (though propagation is stopped below)
			 */
			if ((e.target as HTMLElement).classList.contains("close"))
			{
				return;
			}

			// Toggle state
			element.tags[tagname] = !element.tags[tagname];

			// Update visual appearance
			if (element.tags[tagname])
			{
				tag.classList.remove("disabled");
			}
			else
			{
				tag.classList.add("disabled");
			}

			// Notify changes
			triggerChange();
		});

		// Event listener: Remove tag when 'close' is clicked
		tag.querySelector(".close")!.addEventListener("click", (e: Event) =>
		{
			e.stopPropagation(); // Prevent triggering the toggle click on parent
			const tagname = tag.data;

			// Update state
			delete element.tags[tagname];

			// Remove from DOM
			LiteGUI.remove(tag);

			// Notify removal and changes
			Trigger(element, "wremoved", tagname);
			triggerChange();
		});

		// Append to container
		container.appendChild(tag);

		// Notify addition and changes
		triggerChange();
		Trigger(element, "wadded", tagname);
	}

	/**
	 * Helper to propagate changes to the Inspector and callbacks.
	 */
	function triggerChange()
	{
		that.values.set(valueName, element.tags);
		if (options!.callback) { options!.callback.call(element, element.tags); }
		Trigger(element, "wchange", element.tags);
		if (that.onChange) { that.onChange(valueName, element.tags, element); }
	}

	// Finalize widget attachment to the Inspector
	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addTags(name?: string, values?: string[], options?: AddTagOptions): InspectorTagsWidget;
	}
}

Inspector.prototype.addTags = function (name?: string, values?: string[], options?: AddTagOptions): InspectorTagsWidget
{
	return AddTags(this, name, values, options);
};

Inspector.widgetConstructors.tags = "addTags";