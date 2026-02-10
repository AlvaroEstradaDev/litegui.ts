# Building an Application Layout

This guide walks you through creating a professional application layout similar to standard desktop IDEs. We will use `LiteGUI.Area`, `LiteGUI.Menubar`, and `LiteGUI.Panel` to create a responsive interface.

## The Goal

We want to create a layout with:
1. A top menu bar.
2. A main workspace area.
3. A collapsible side panel (Inspector).
4. A bottom panel (Console).

## Step 1: Initialization

First, initialize LiteGUI. This sets up the global environment and styles.

**Example**
```javascript
LiteGUI.init();
```

## Step 2: The Menu Bar

Create the top menu bar using `LiteGUI.Menubar`.

**Example**
```javascript
const menubar = new LiteGUI.Menubar("mainmenubar");
LiteGUI.add(menubar);

// Add some items
menubar.add("File/New", { callback: () => console.log("New") });
menubar.add("File/Open", { callback: () => console.log("Open") });
menubar.add("Help/About");
```

## Step 3: Main Area

The `Area` is the root container for your workspace. It handles resizing and splitting.

**Example**
```javascript
var mainarea = new LiteGUI.Area({
    id: "mainarea",
    contentId: "canvasarea",
    height: "calc( 100% - 20px )", // Subtract menubar height
    main: true,
    immediateResize: true
});
LiteGUI.add(mainarea);
```

## Step 4: Splitting the View

You can split an area horizontally or vertically.

```javascript
// Split horizontal: Left side (auto), Right side (300px)
mainarea.split("horizontal", [null, 300], true);
```

Now you have two sections:
- `mainarea.getSection(0)`: The left (main) part.
- `mainarea.getSection(1)`: The right (sidebar) part.

## Step 5: Adding Panels

Panels are containers with a header that can be docked into areas.

**Example**
```javascript
// Create a panel for the sidebar
const sidePanel = new LiteGUI.Panel("sidepanel", { 
    title: "Inspector", 
    scrollable: true 
});

// Add it to the right section
mainarea.getSection(1).add(sidePanel);

// Add content to the panel
const inspector = new LiteGUI.Inspector();
inspector.addString("Name", "Project");
sidePanel.add(inspector);
```

## Step 6: Tabs

Tabs are great for organizing content within panels.

**Example**
```javascript
const tabs = new LiteGUI.Tabs({
    size: "full",
    callback: (tabId) => console.log("Switched to " + tabId)
});

// Add tabs
tabs.addTab("Properties");
tabs.addTab("Settings");

// Add content to a tab
const settingsTab = tabs.getTabContent("Settings");
settingsTab.innerHTML = "<p>Some HTML content</p>";

// Add tabs to the panel
sidePanel.add(tabs);
```

## Complete Example

This structure allows you to build complex tools. Typically you would put your main content (like a 3D canvas or a code editor) in `mainarea.getSection(0)` and your tools in the side panels.
