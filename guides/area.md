# LiteGUI.Area

Areas are a way to split the layout of your site into regions so it is easy to fill the content without having to specify fixed sizes.
Areas usually are meant to be filled by Inspectors, Canvases, widgets or some specific HTML content. This way your interface will be adapted depending on the resolution.

## Creating an Area

To create one first instantiate the class:

**Example**
```javascript
const mainarea = new LiteGUI.Area();
```

You can pass several options as a parameter:

```javascript
const mainarea = new LiteGUI.Area({
    content_id: "workarea", 
    height: "calc(100% - 30px)", 
    autoresize: true, 
    immediateResize: true, 
    minSplitSize: 200 
});
```

## Options

Some of the properties that you can pass when creating the Area:

- **content_id**: id for the container of the area content
- **height**: the height of the whole container
- **autoresize**: if true the container will use all the space available in the parent container
- **immediateResize**: when dragging the splitter it will update contents immediately
- **minSplitSize**: minimum size the splitter allows for one side.

## Split

When you want to divide an area in two sections you can split it:

**Example**
```javascript
mainarea.split("horizontal", [null, side_panel_width], true);
```

The parameters are:
1. **Alignment**: Could be "horizontal" or "vertical". Horizontal means that the areas will be side by side in the horizontal axis (so the split line will be vertical).
2. **Distribution**: The array passed as a second parameter contains the size of every section, it could be a number or a string containing a size. `null` means that this area should fill the remaining space.
3. **Editable**: Tells if you want to allow the user to change the split position using the mouse.


## Sections

When splitting an area it creates two new areas (called sections), to access them you can use:

**Example**
```javascript
const section = mainarea.getSection(0);
```

This section can be split again to create more complex layouts.
