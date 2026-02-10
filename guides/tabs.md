# LiteGUI.Tabs

Tabs are a common UI pattern to organize content.

## Creating Tabs

**Example**
```javascript
const tabs = new LiteGUI.Tabs({});

// Add a tab
const tab1 = tabs.addTab("tab1", { title: "MyTab1" });

// Add content to the tab
// You can just append widgets
tab1.add( inspector );

// Or modify the content directly
const tab2 = tabs.addTab("tab2", { title: "Settings" });
tab2.content.innerHTML = "This is the settings tab";
```
