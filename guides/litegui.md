# LiteGUI Guide

LiteGUI is a library to create complex web interfaces for desktop applications. It provides a set of components that are easy to use and very configurable.

## Installation

### CSS
Include the stylesheet in your HTML header:

```html
<link rel="stylesheet" type="text/css" href="path/to/litegui.css">
```

### Javascript
Include the library script:

```html
<script type="text/javascript" src="path/to/litegui.js"></script>
```

If you do not need the TypeScript source maps (larger file size but better debugging), you can use the minified version:

```html
<script type="text/javascript" src="path/to/litegui.mini.js"></script>
```

## Getting Started

To start using LiteGUI you need to initialize the library. This will prepare the environment.

### Example

```javascript
// Initialize LiteGUI
LiteGUI.init();

// Create a main menu
const mainmenu = new LiteGUI.Menubar("mainmenubar");
LiteGUI.add(mainmenu);

// Create the main area
const mainarea = new LiteGUI.Area({
    id: "mainarea",
    contentId: "canvasarea",
    height: "calc( 100% - 20px )",
    main: true,
    immediateResize: true
});
LiteGUI.add(mainarea);

// Split the area
mainarea.split("horizontal", [null, 300], true);
```

## Global Namespace

The global `LiteGUI` object contains many helper functions and the constructors for all widgets.

| Method | Description |
| :--- | :--- |
| `LiteGUI.init()` | Initializes the library. |
| `LiteGUI.add( component )` | Adds a top-level component (like Menubar or Area) to the document body. |
| `LiteGUI.alert( message, title, callback )` | Shows a modal alert dialog. |
| `LiteGUI.confirm( message, callback )` | Shows a modal confirmation dialog. |
| `LiteGUI.prompt( message, callback )` | Shows a modal prompt dialog. |

### Modal Dialogs Example

**Example**
```javascript
LiteGUI.alert("File saved successfully!", "Info", function() {
    console.log("Alert closed");
});

LiteGUI.confirm("Are you sure you want to delete this?", function(result) {
    if (result) {
        console.log("Deleted.");
    }
});
```

## Next Steps

- Check the [Building Layouts](building_layout.md) guide to learn how to create a full application interface.
- Check the [Inspector](inspector.md) guide to learn how to create property editors.
