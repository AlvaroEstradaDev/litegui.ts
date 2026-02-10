# Dialogs

Dialogs are floating windows that can be moved, resized, and closed. They are essential for settings panels, alerts, and complex inputs.

## Creating a Dialog

To create a dialog, instantiate `LiteGUI.Dialog` with options.

### Example

```javascript
const dialog = new LiteGUI.Dialog({
    id: "my-dialog",
    title: "Settings",
    close: true,
    minimize: true,
    width: 300,
    height: 400,
    draggable: true,
    resizable: true
});

// Show the dialog
dialog.show();

// Center it on screen
dialog.center();
```

## Adding Content

Dialogs act like containers. You can add HTML strings or widgets to them.

```javascript
// Add simple HTML content
dialog.add("<p>This is a custom dialog</p>");

// Add an Inspector with widgets
const widgets = new LiteGUI.Inspector();
widgets.addString("Name", "Foo");
widgets.addButton(null, "Save", { callback: function() { dialog.close(); } });

dialog.add(widgets);

// Adjust size to fit content
dialog.adjustSize();
```

## Specialized Dialogs

LiteGUI provides shortcuts for common dialog types.

### Alert

**Example**
```javascript
LiteGUI.alert("Operation completed successfully", { title: "Success" });
```

### Confirm

**Example**
```javascript
LiteGUI.confirm("Are you sure?", function(result) {
    if(result) {
        console.log("User clicked Yes");
    } else {
        console.log("User clicked No");
    }
});
```

### Prompt

**Example**
```javascript
LiteGUI.prompt("Enter your name", function(value) {
    if(value) {
        console.log("Hello " + value);
    }
});
```

## Advanced Example: Dialog with Table

You can embed complex components like Tables inside a dialog.

**Example**
```javascript
// Create dialog
const tableDialog = new LiteGUI.Dialog({
    title: "Users",
    width: 500,
    height: 300,
    resizable: true
});

// Create table
const table = new LiteGUI.Table({
    scrollable: true,
    height: "100%"
});

// Define columns
table.setColumns(["ID", "Name", "Role"]);

// Add data
table.addRow([1, "John Doe", "Admin"]);
table.addRow([2, "Jane Smith", "User"]);

// Add table to dialog
tableDialog.add(table);

// Show it
tableDialog.show();
tableDialog.center();
```
