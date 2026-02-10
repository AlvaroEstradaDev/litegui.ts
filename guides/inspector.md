# Inspector

The `Inspector` class is a powerhouse for creating property editors. It handles the layout, labels, and interaction logic for you.

![Example](imgs/inspector.png "Inspector example")

## Creating an Inspector

**Example**
```javascript
const inspector = new LiteGUI.Inspector({
    width: 400,
    nameWidth: 100
});
inspector.appendTo( document.body );
```

## Adding Widgets

The Inspector provides methods to add various widgets. 
**For a complete list of available widgets and their options, check the [Inspector Widgets Reference](inspector_widgets.md).**

The generic syntax is:

```javascript
inspector.add( "widget_type", "Label", value, options );
```

Or using specific methods:

```javascript
inspector.addString("Label", "Value", { callback: ... });
```

### Available Widgets

Here is a list of all the widgets available:

*   **title** or **addTitle**: to add a title to the widgets. Parameter String
*   **info** or **addInfo**: to add HTML code. Parameter String.
*   **number** or **addNumber**: to edit a number (adds a dragger and allows to control precision). Parameter Number.
*   **slider** or **addSlider**: to edit a number between a range using a slider. Parameter Number.
*   **string**, **text** or **addString**: to edit a short string. Parameter String.
*   **textarea** or **addTextarea**: to edit a long string. Parameter String.
*   **color** or **addColor**: to select a color. Parameter array of 3.
*   **boolean**, **checkbox** or **addCheckbox**: to select between on or off (true false). Parameter Boolean.
*   **icon** or **addIcon**: to add a clickable icon (it allows to have two images). Parameter String.
*   **vec2**, **vector2** or **addVector2**: to edit two numbers. Parameter Array of 2.
*   **vec3**, **vector3** or **addVector3**: to edit three numbers. Parameter Array of 3.
*   **vec4**, **vector4** or **addVector4**: to edit four numbers. Parameter Array of 4.
*   **enum**, **combo** or **addCombo**: to select between multiple choices. Parameter String.
*   **button** or **addButton**: a clickable button. Parameter String.
*   **buttons** or **addButtons**: several clickable buttons. Parameter Array of String.
*   **file** or **addFile**: to choose a file from the hard drive. Parameter String.
*   **line** or **addLineEditor**: to edit the points of a line. Parameter Array of Vec2.
*   **list** or **addList**: to select items from a list. Parameter Array or Object
*   **tree** or **addTree**: to select items from a tree (it creates a LiteGUI.Tree widget). Parameter Object.
*   **datatable** or **addDataTree**: to select items from a basic object
*   **pad** or **addPad**: like a slider but with two dimensions
*   **array** or **addArray**: to select the values of an array. Parameter Array.
*   **separator** or **addSeparator**: a separator between widgets
*   **null** or **addNull**: it does not create anything (used in some special cases)
*   **tags** or **addTags**: to manage a list of tags. Parameter Array of Strings.
*   **flags** or **addFlags**: to edit multiple boolean flags. Parameter Object.

For a better explanation of the parameters for every widget check the guide for widgets and the documentation.

And to see a complete list check the `LiteGUI.Inspector.widgetConstructors` from the console of your browser.

## Layout and Grouping

You can organize widgets into sections or groups to keep the interface clean.

### Sections
Sections typically have a header and can be collapsed.

```javascript
const section = inspector.addSection("User Settings", { collapsed: false });

inspector.addString("Username", "admin");
inspector.addCheckbox("Active", true);

inspector.endCurrentSection();
```

### Groups
Groups are simpler containers, often used for visual grouping without a heavy header.

```javascript
inspector.beginGroup("Details");
inspector.addNumber("Age", 30);
inspector.endGroup();
```

### Separators
Use `addSeparator()` to add a horizontal line or space between widgets.

```javascript
inspector.addSeparator();
```

### Widget Common Options

Every widget function allows to pass an object containing parameters for the widget. All widgets support a base set of parameters, and some widgets have some special parameters. Here is a list of the base parameters supported by all widgets:

*   **width**: to select the widgets total width, this is used mostly in horizontal inspectors.
*   **height**: the height of the widget.
*   **nameWidth**: the width of the name part of the widget.
*   **contentWidth**: the width of the content part of the widget.
*   **callback**: the function to call when the user interacts with the widget.
*   **disabled**: if you want the widget to be disabled (not allow to interact).
*   **preTitle**: some HTML code to put before the name of the widget (used for special icons).
*   **title**: used to show info when the user do a mouse over.
*   **id**: to set an id to the container.

```javascript
inspector.addString("name", username, { width: "50%", disabled: true });
```

## Manipulating a Widget

Once the widget is created it will return an object that you can keep to do changes in the future. Here are some examples:

```javascript
var usernameWidget = inspector.addString("Username", user.name, { callback: myCallback });
usernameWidget.setValue("foo");
var value = usernameWidget.getValue();
```

Changing the value of a widget will trigger the events that call the callbacks associated. If you don't want to trigger any event, pass `false` as the second parameter:

```javascript
usernameWidget.setValue("foo", false);
```

## Packing Widgets

You can put two or more widgets in the same line by changing the value `widgetsPerRow` which controls how many widgets per row in the inspector:

```javascript
inspector.widgetsPerRow = 2;
inspector.addCheckbox(...);
inspector.addCheckbox(...);
inspector.widgetsPerRow = 1;
```

## Clearing the Inspector

You can clear the inspector at any time to remove all the widgets:

```javascript
inspector.clear();
```

## Inspecting an Instance

In case you want to edit the content of an instance but do not want to create the widgets manually you can use `inspectInstance`. Keep in mind that it only works for basic types or with objects that contain info about the widgets to use with every property of the instance.

```javascript
var myInstance = { name: "javi", age: 37 };
inspector.inspectInstance( myInstance );
```

To add info about the widget to use in one property of the instance there are several ways:

```javascript
// if the object is of one specific class created by yourself
myInstance.constructor["@propertyName"] = { widget: "slider" };

// or if it is a regular object
myInstance["@propertyName"] = { widget: "slider" };
```

If you don't want to show all the properties you can specify the `getInspectorProperties` method in the instance:

```javascript
instance.getInspectorProperties = function(){ 
    return { 
        age: { widget: "slider" }, 
        name: { type: "string" } 
    }; 
};
```

If you want to specify the order in which they are shown:

```javascript
myInstance.constructor.properties_order = ["age", "name"];
```

## Sections, Groups and Containers

Every widget is added to the current section. If you want to create new sections you can call the `addSection` method, then you can add later widgets to that section. Sections can be collapsed.

```javascript
var section = inspector.addSection("My tools");
// ... add widgets ...
inspector.setCurrentSection(section);
```

If you want to pack several widgets in a group so it can be collapsed (similar to a section but much simpler), then use `beginGroup` and `endGroup`.

Or if you just want to put the next widgets inside some DOM element for any reason, you can call `startContainer` and `endContainer`.

## Updating all widgets

If you want to update the value of every widget in an inspector you can call the `updateWidgets` method. This will check all the widgets to see if they contain a `onUpdate` method in its options or a `onWidgetUpdate` in the widget, and if that is the case, it will call it. This is helpful when you don't want to rebuild all the widgets everytime a value has changed.

## Adapting size

When creating a dialog with an Inspector inside it is hard to know the height of all the widgets. Remember that you can call the method `adjustSize` in the `LiteGUI.Dialog` to adapt the dialog height to the content.

## Adding Custom Widgets

To add new custom widgets you can register them.

You can extend `LiteGUI.Inspector.prototype` or use `LiteGUI.Inspector.registerWidget`.

First, create the function in charge of creating the widget:

```javascript
function MyWidgetFunction(name, value, options) {
    options = this.processOptions(options);
    
    // Create the HTML representation
    var widgetHtmlCode = "<button>Click Me</button>";
    var element = this.createWidget(name, widgetHtmlCode, options);
    
    // Add logic
    element.querySelector("button").onclick = function() {
        console.log("Clicked");
    };
    
    // Add the setValue method to the element
    element.setValue = function(v) { 
        // ... update UI ...
    };
    
    // Add the getValue method to the element
    element.getValue = function() { 
        return "some value"; 
    };

    // Attach to inspector
    this.append(element, options);
    
    // Process element (add update hooks)
    this.processElement(element, options);
    
    return element;
}
```

Finally, register it:

```javascript
// Attach it to the inspector prototype
LiteGUI.Inspector.prototype.addMyWidget = MyWidgetFunction;

// Add to widgets list
LiteGUI.Inspector.widgetConstructors["mytype"] = "addMyWidget";
// OR
LiteGUI.Inspector.registerWidget("mytype", "addMyWidget");
```
