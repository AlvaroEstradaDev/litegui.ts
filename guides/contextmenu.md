# LiteGUI.ContextMenu

If you want to show a context menu when the users does an action use the `LiteGUI.ContextMenu` class.

## Creating a Context Menu

To create a context menu:

**Example**
```javascript
const contextmenu = new LiteGUI.ContextMenu( actions, { 
    callback: function(v) { ... } 
});
```

The callback will be called once an action has been chosen.

## Actions

Actions is an array containing a list of actions in the next form:

You can pass just strings:

```javascript
const actions = ["Copy", "Paste", null, "Delete"];
```

`null`s are used to create separators.

Or if you want to have more info then pass an object with the next properties:

```javascript
const actions = [
    {
       title: "Copy", // text to show
       disabled: true, // option will be disabled
       callback: myCopyCallback, // callback to call when the option is clicked
       submenu: { ... } // object containing info of a secondary menu to show 
    },
    // ...
];
```

## Options

The available options for the context menu are (all are optional):

- **parentMenu**: the previous ContextMenu in case you want to chain this menu with an existing one
- **title**: text to show on top
- **callback**: function to call once an option has been selected
- **ignoreItemCallbacks**: if true no item callbacks will be executed
- **event**: the event of the mouse that triggered to show this menu, used to position the menu right below the mouse
- **autoopen**: if the menu should be auto opened when the mouse passed over
- **left**: pixels from left
- **top**: pixels from top

## Items

Every item in the menu could have several options:

- **title**: text to show
- **disabled**: if the user can click it
- **submenu**: the info about the submenu of this option
- **hasSubmenu**: to show that this option has more suboptions
- **callback**: a callback to call when this option is clicked

## Item Callback

Once an item is clicked the callback will receive the next info:

```javascript
function optionCallback( value, options, event, parentContextMenu )
{
	// ...
}
```

## Chaining Context Menus

You can open a new context menu when an option is called.

**Example**
```javascript
function optionCallback( value, options, event, parentContextMenu )
{
	const newMenu = new LiteGUI.ContextMenu( ["option1","option2"], { 
        event: event, 
        parentMenu: parentContextMenu, 
        callback: myCallback 
    });
}
```

Or when defining the properties of the main item that opens this submenu, using the next syntax:

```javascript
[
    "regular_option", 
    { 
        title: "extra options", 
        submenu: { 
            options: ["action1", "action2"] 
        } 
    }
];
```

## Capturing the Right Mouse Click

To capture the right mouse click and show the context menu I suggest this example:

**Example**
```javascript
element.addEventListener("contextmenu", function(e) { 
    if(e.button != 2) // right button
        return false;
    
    // create the context menu
    const contextmenu = new LiteGUI.ContextMenu( actions, { 
        event: e, 
        callback: function(v) { ... }
    });
    
    e.preventDefault(); 
    return false;
});
```
