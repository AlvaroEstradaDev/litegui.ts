import type { Inspector } from "../../inspector/inspector";
import type { FileAddedResponse } from "../../inspector/file";
import type { TreeData } from "../../widgets/tree";

/**
 ***********************************************************************************************
 * Inspector types
 ***********************************************************************************************
 */

/**
 * Union type representing possible values for inspector widgets.
 */
export type InspectorValue = number | string | boolean | InspectorValue[] |
	{ [key: string]: InspectorValue } | FileAddedResponse | TreeData | undefined;

/**
 * String union type defining all supported widget types in the inspector.
 */
export type InspectorWidgetTypes = 'null' | 'undefined' |
	'title' | 'info' | 'number' | 'slide' |
	'string' | 'text' | 'textarea' | 'color' |
	'boolean' | 'checkbox' | 'icon' | 'vec2' |
	'vector2' | 'vec3' | 'vector3' | 'vec4' |
	'vector 4' | 'enum' | 'string' | 'dropdown' |
	'combo' | 'button' | 'buttons' | 'file' |
	'line' | 'list' | 'tree' | 'datatree' |
	'pad' | 'array' | 'separator' | 'function';

/**
 ***********************************************************************************************
 * Inspector options
 ***********************************************************************************************
 */

/**
 * Configuration options for creating an Inspector instance.
 * @interface InspectorOptions
 */
export interface InspectorOptions
{
	/**
	 * Type identifier for the inspector.
	 */
	type?: string;

	/**
	 * Parent element to append the inspector to.
	 */
	parent?: HTMLElement;

	/**
	 * Callback function triggered when any value in the inspector changes.
	 * @param {string} [name] The name of the property that changed.
	 * @param {InspectorValue} [value] The new value.
	 * @param {InspectorWidget} [element] The widget element that triggered the change.
	 */
	onChange?: (name?: string, value?: InspectorValue, element?: InspectorWidget) => void;

	/**
	 * If true, disables the default scroll behavior.
	 */
	noscroll?: boolean;

	/**
	 * Width for the widgets area.
	 */
	widgetsWidth?: number;

	/**
	 * Width for the name/label area.
	 */
	nameWidth?: number;

	/**
	 * Height of the inspector.
	 */
	height?: string | number;

	/**
	 * Width of the inspector.
	 */
	width?: string | number;

	/**
	 * If true, renders widgets in a single line layout.
	 */
	oneLine?: boolean;

	/**
	 * If true, uses full width for widgets.
	 */
	full?: boolean;

	/**
	 * Offset width adjustment.
	 */
	offsetWidth?: number;

	/**
	 * Offset height adjustment.
	 */
	offsetHeight?: number;

	/**
	 * CSS class name to add to the inspector container.
	 */
	className?: string;

	/**
	 * ID attribute for the inspector container.
	 */
	id?: string;

	/**
	 * If true, the inspector starts collapsed.
	 */
	collapsed?: boolean;

	/**
	 * If true, prevents the inspector from being collapsible.
	 */
	noCollapse?: boolean;

	/**
	 * The object instance associated with the inspector.
	 */
	instance?: object;

	/**
	 * Number of widgets per row.
	 */
	widgetsPerRow?: number;

	/**
	 * Callback function executed when the inspector collapse state changes.
	 * @param {boolean} value True if collapsed, false otherwise.
	 */
	callback?: (value: boolean) => void;
}

/**
 * Options related to processing or updating an element.
 * @interface ProcessElementOptions
 */
export interface ProcessElementOptions
{
	/**
	 * Callback function triggered on update.
	 * @returns {unknown} return value.
	 */
	onUpdate?: () => unknown;
}

/**
 * Options for appending widgets to the DOM.
 * @interface AppendOptions
 */
export interface AppendOptions
{
	/**
	 * Parent HTMLDivElement to append the widget to.
	 */
	widgetParent?: HTMLDivElement;

	/**
	 * HTMLDivElement to replace with the new widget.
	 */
	replace?: HTMLDivElement;
}

/**
 * Options for adding a container.
 * @interface AddContainerOptions
 */
export interface AddContainerOptions extends HTMLDivElementOptions
{
	/**
	 * Number of widgets per row in the container.
	 */
	widgetPerRow?: number;
}

/**
 * Options for beginning a group of widgets.
 * @interface BeginGroupOptions
 */
export interface BeginGroupOptions extends AppendOptions
{
	/**
	 * Title of the group.
	 */
	title?: string;

	/**
	 * If true, the group starts collapsed.
	 */
	collapsed?: boolean;

	/**
	 * Content height of the group.
	 */
	height?: number | string;

	/**
	 * If true, the group content is scrollable.
	 */
	scrollable?: boolean;
}

/**
 * Common options for HTMLDivElements in the inspector.
 * @interface HTMLDivElementOptions
 */
export interface HTMLDivElementOptions
{
	/**
	 * CSS class name to add to the element.
	 */
	className?: string;

	/**
	 * ID attribute for the element.
	 */
	id?: string;

	/**
	 * Width of the element.
	 */
	width?: string | number;

	/**
	 * Height of the element.
	 */
	height?: string | number;
}

/**
 * Comprehensive options for creating a widget.
 * @interface CreateWidgetOptions
 */
export interface CreateWidgetOptions extends AppendOptions, ProcessElementOptions, HTMLDivElementOptions
{
	/**
	 * Title or label for the widget. Can be an array for multiple titles.
	 */
	title?: string | string[];

	/**
	 * Text to display before the title.
	 */
	preTitle?: string;

	/**
	 * Internal name for the widget.
	 */
	widgetName?: string;

	/**
	 * Width of the name/label section.
	 */
	nameWidth?: number | string;

	/**
	 * Width of the content section.
	 */
	contentWidth?: number | string;
}

/**
 * Options for handling widget value changes.
 * @interface WidgetChangeOptions
 */
export interface WidgetChangeOptions
{
	/**
	 * If true, skips the widget change event.
	 */
	skipWChange?: boolean;

	/**
	 * Callback function triggered when the widget value changes.
	 * @param {InspectorValue} value The new value.
	 * @param {Event} [e] The event object.
	 */
	callback?: ((value: InspectorValue, e?: Event) => void) | ((...args: unknown[]) => void);
}

/**
 * Options for creating a property widget bound to an object instance.
 * @interface PropertyOptions
 */
export interface PropertyOptions extends GenericCreationOptions
{
	/**
	 * The object instance containing the property.
	 */
	instance?: object;

	/**
	 * The name of the property variable.
	 */
	varname?: string | number;

	/**
	 * The widget type or instance.
	 */
	widget?: InspectorWidgetTypes | string;

	/**
	 * Callback function triggered on change.
	 * @param {unknown} [value] The new value.
	 * @param {Event} [e] The event object.
	 */
	callback?: ((value?: unknown, e?: Event) => void) | ((...args: unknown[]) => void);
}

/**
 * Generic options for creating various types of widgets.
 * @interface GenericCreationOptions
 */
export interface GenericCreationOptions extends CreateWidgetOptions
{
	/**
	 * The type of widget to create.
	 */
	type?: InspectorWidgetTypes;

	/**
	 * The name/label of the widget.
	 */
	name?: string;

	/**
	 * The initial value of the widget.
	 */
	value?: InspectorValue;

	/**
	 * Additional creation options.
	 */
	options?: CreateWidgetOptions;
}

/**
 * Options for adding a title widget.
 * @interface AddTitleOptions
 */
export interface AddTitleOptions extends AppendOptions
{
	/**
	 * Help text to display (e.g., in a tooltip).
	 */
	help?: string;
}

/**
 ***********************************************************************************************
 * Inspector Widgets
 *********************************************************************************************
 */

/**
 * Interface for an inspector container element.
 * @interface InspectorContainer
 */
export interface InspectorContainer extends HTMLDivElement
{
	/**
	 * Refreshes the container.
	 */
	refresh: () => void;

	/**
	 * Callback executed when the container is refreshed.
	 * @param {InspectorContainer} container The container being refreshed.
	 */
	onRefresh: (container: InspectorContainer) => void;
}

/**
 * Interface for an inspector section element.
 * @interface InspectorSection
 */
export interface InspectorSection extends HTMLElement
{
	/**
	 * Reference to a parent or associated section.
	 */
	section?: InspectorSection;

	/**
	 * The title element of the section.
	 */
	sectionTitle?: Element;

	/**
	 * The object instance associated with the section.
	 */
	instance?: object;

	/**
	 * Internal stack for container management.
	 */
	lastContainerStack?: InspectorContainer[];

	/**
	 * Refreshes the section.
	 */
	refresh: () => void;

	/**
	 * Callback executed when the section is refreshed.
	 * @param {InspectorSection} widget The section being refreshed.
	 */
	onRefresh: (widget: InspectorSection) => void;

	/**
	 * Clean up or end the section.
	 */
	end: () => void;
}

/**
 * Base interface for an inspector widget.
 * @interface InspectorWidget
 */
export interface InspectorWidget extends HTMLDivElement
{
	/**
	 * Reference to the Inspector instance.
	 */
	inspector?: Inspector;

	/**
	 * Reference to the section containing this widget.
	 */
	section?: InspectorSection;

	/**
	 * Configuration options used to create this widget.
	 */
	options?: CreateWidgetOptions;

	/**
	 * The name of the widget.
	 */
	name?: string;

	/**
	 * The content element of the widget.
	 */
	content?: HTMLElement;

	/**
	 * Callback function executed when the widget is updated.
	 * @param {InspectorWidget} widget The widget being updated.
	 */
	onWidgetUpdate?: (widget: InspectorWidget) => void;

	/**
	 * Gets the current value of the widget.
	 * @returns {InspectorValue} The current value.
	 */
	getValue?: () => InspectorValue;

	/**
	 * Sets the value of the widget.
	 * @param {InspectorValue} [value] The value to set.
	 * @param {boolean} [skipEvent] If true, does not trigger change events.
	 */
	setValue?: (value?: InspectorValue, skipEvent?: boolean) => void;

	/**
	 * Sets the icon for the widget.
	 * @param {string} img URL or identifier for the icon image.
	 */
	setIcon?: (img: string) => void;

	/**
	 * Disables the widget.
	 */
	disable?: () => void;

	/**
	 * Enables the widget.
	 */
	enable?: () => void;
}

/**
 * Interface for a group widget in the inspector.
 * @interface InspectorGroupWidget
 */
export interface InspectorGroupWidget extends InspectorWidget
{
	/**
	 * Indicates if this widget acts as a group.
	 */
	group?: boolean;
}

/**
 * Interface for an active inspector widget, requiring standard methods to be present.
 * @interface InspectorActiveWidget
 */
export interface InspectorActiveWidget extends InspectorWidget
{
	/**
	 * Reference to the Inspector instance.
	 */
	inspector: Inspector;

	/**
	 * Reference to the section containing this widget.
	 */
	section: InspectorSection;

	/**
	 * Configuration options used to create this widget.
	 */
	options: CreateWidgetOptions;

	/**
	 * The name of the widget.
	 */
	name: string;

	/**
	 * The content element of the widget.
	 */
	content: HTMLElement;

	/**
	 * Callback function executed when the widget is updated.
	 * @param {InspectorWidget} widget The widget being updated.
	 */
	onWidgetUpdate: (widget: InspectorWidget) => void;

	/**
	 * Gets the current value of the widget.
	 * @returns {InspectorValue} The current value.
	 */
	getValue: () => InspectorValue;

	/**
	 * Sets the value of the widget.
	 * @param {unknown} [value] The value to set.
	 * @param {boolean} [skipEvent] If true, does not trigger change events.
	 */
	setValue: (value?: InspectorValue, skipEvent?: boolean) => void;

	/**
	 * Sets the icon for the widget.
	 * @param {string} img URL or identifier for the icon image.
	 */
	setIcon: (img: string) => void;

	/**
	 * Disables the widget.
	 */
	disable: () => void;

	/**
	 * Enables the widget.
	 */
	enable: () => void;
}