# Inspector Widgets Reference

This is a reference for the widgets available in `LiteGUI.Inspector`. For general usage and examples, see the [Inspector Guide](inspector.md).

## Common Widgets

### Buttons

**Example**
```javascript
// Single button
inspector.addButton("Actions", "Save", { 
    callback: function(v) { console.log("Saved"); } 
});

// Multiple buttons
inspector.addButtons("Actions", ["Save", "Load"], { 
    callback: function(v) { console.log("Clicked: " + v); } 
});
```
**Additional Options:**
- `width`: Set a custom width for the button(s).
- `micro`: If set to `true`, renders a smaller "micro" button.
- `disabled`: Set to `true` to disable interaction.

### Booleans (Checkbox)

**Example**
```javascript
inspector.addCheckbox("Enabled", true, { 
    callback: function(v) { console.log("Value: " + v); } 
});
```
**Additional Options:**
- `labelOn`: Text to show when checked (e.g., "On").
- `labelOff`: Text to show when unchecked (e.g., "Off").
- `nameWidth`: Adjust the width of the label.

### Numbers & Sliders

**Example**
```javascript
// Simple number
inspector.addNumber("Width", 100, { min: 0, step: 1 });

// Slider
inspector.addSlider("Opacity", 0.5, { min: 0, max: 1 });
```
**Additional Options:**
- `min`: Minimum value allowed.
- `max`: Maximum value allowed.
- `step`: Increment step for dragging or arrow keys.
- `precision`: Number of decimal places to display.
- `units`: String to display after the number (e.g., "px", "%").

### Vectors

**Example**
```javascript
inspector.addVector2("Position", [10, 20]);
inspector.addVector3("Rotation", [0, 90, 0]);
inspector.addVector4("Color", [0, 1, 0, 1]);
```
**Additional Options:**
- `min`: Minimum value for all components.
- `step`: Increment step.
- `smooth`: If `true`, dragging is smoother.

### Text

**Example**
```javascript
// Single line
inspector.addString("Name", "Foo");

// Multi line
inspector.addTextarea("Description", "Long text...", { height: 100 });
```
**Additional Options:**
- `disabled`: Make the input read-only.
- `placeholder`: Text to show when empty (if supported by browser/widget).
- `immediate`: If `true`, callback fires on every keypress (default usually requires Enter or Blur).

### Color

**Example**
```javascript
// RGB Array [0..1]
inspector.addColor("Color", [1.0, 0.5, 0.5]);
```
**Additional Options:**
- The color widget usually opens a color picker dialog when clicked.
- Supports RGB arrays (values 0-1) by default or 0-255 if configured (check library version specifics).

### addCombo
Creates a dropdown menu.

```javascript
inspector.addCombo("MyCombo", value, { 
    values: ["A", "B", "C"], 
    callback: function(v) { ... } 
});
```

### addList
Creates a list of selectable items.

```javascript
const widget = inspector.addList("MyList", values, { 
    callback: function(v) { ... } 
});
```

Useful methods:
* `updateItems(items)`: changes the items
* `getSelected()`: returns selected elements
* `scrollToIndex(index)`: scrolls to item

### addFile
Allows listing files or uploading.

```javascript
inspector.addFile("Select File", "", { 
    callback: function(v) { ... } 
});
```

### Tree (Hierarchy)

**Example**
```javascript
inspector.addTree("Scene Graph", {
    id: "root",
    children: [
        { id: "node1", children: [] },
        { id: "node2", children: [] }
    ]
}, { 
    height: 150,
    callback: function(node) { console.log("Selected: " + node.id); }
});
```

### DataTree

**Example**
```javascript
inspector.addDataTree("Data", {
    name: "Root",
    val: 10,
    child: { name: "Child", val: 20 }
}, { height: 150 });
```

### Line Editor (Curve)

**Example**
```javascript
inspector.addLineEditor("Curve", [[0,0], [1,1]], {
    callback: function(points) { console.log("Points: " + points); }
});
```
**Additional Options:**
- `defaultY`: Default Y value.
- `width`: Width of the editor.

### Tags

**Example**
```javascript
inspector.addTags("Tags", ["tag1", "tag2"], { 
    callback: function(tags) { console.log(tags); } 
});
```

### Flags

**Example**
```javascript
inspector.addFlags({ "Feature A": true, "Feature B": false }, {}, {
    callback: function(flags) { console.log(flags); }
});
```

### Pad (2D Position)

**Example**
```javascript
inspector.addPad("Movement", [0.5, 0.5], { 
    callback: function(v) { console.log("X:" + v[0] + " Y:" + v[1]); } 
});
```

### Array

**Example**
```javascript
inspector.addArray("My Array", ["A", "B"], { 
    dataType: "string", 
    maxItems: 10,
    callback: function(v) { console.log(v); } 
});
```

