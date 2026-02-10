import { LiteGUIObject } from "./@types/globals";
import { SizeToCSS } from "./utilities";

/**
 * Configuration options for the Table widget.
 */
export interface TableOptions
{
	/** Initial data for the table rows. */
	data?: (string | number | (string | number)[] | Record<string, string | number>)[];
	/** Pre-existing row elements to include. */
	rows?: Array<HTMLTableRowElement>;
	/** Specific height for the table. */
	height?: number | string;
	/** Whether the table should have a scrollbar. */
	scrollable?: boolean;
	/** Column definitions. */
	columns?: Array<string | TableColumn>;
}

/**
 * Definition of a column in the table.
 */
export interface TableColumn
{
	/** The header cell element for this column. */
	tableElement?: HTMLTableCellElement;
	/** CSS class to apply to cells in this column. */
	className?: string;
	/** The property name in the data object mapping to this column. */
	field?: string;
	/** Width of the column (e.g., "100px", "50%"). */
	width?: string | number;
	/** Display name of the column in the header. */
	name?: string;
}

/**
 * A widget for displaying tabular data.
 * @class Table
 * @example
 * ```typescript
 * const table = new LiteGUI.Table({
 *     columns: [{ name: "Name", field: "name" }, { name: "Age", field: "age" }],
 *     data: [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]
 * });
 * parent.appendChild(table.root);
 * ```
 */
export class Table implements LiteGUIObject
{
	/** The root HTMLTableElement of the widget. */
	root: HTMLTableElement;
	/** Array of column definitions. */
	columns: Array<TableColumn>;
	/** Array of row elements. */
	rows: Array<HTMLTableRowElement>;
	/** Array of field names corresponding to columns. */
	columnFields: Array<string>;
	/** The data currently displayed in the table. */
	data: (string | number | (string | number)[] | Record<string, string | number>)[];
	/** The header row element. */
	header?: HTMLTableRowElement;
	/** Current selected value (internal usage). */
	value?: string;

	/** Internal flag to trigger header update. */
	private _mustUpdateHeader: boolean;

	/**
	 * Creates an instance of the Table widget.
	 * @param {TableOptions} [options] Configuration options.
	 */
	constructor(options?: TableOptions)
	{
		options = options ?? {};

		this.root = document.createElement("table");
		this.root.classList.add("litetable");

		this.columns = [];
		this.columnFields = [];
		this.rows = [];
		this.data = [];

		this._mustUpdateHeader = true;

		if (options.scrollable) { this.root.style.overflow = "auto"; }

		if (options.height) { this.root.style.height = SizeToCSS(options.height) as string; }

		if (options.columns) { this.setColumns(options.columns); }

		if (options.rows && options.data) { this.setRows(options.data); }
	}

	/**
	 * Sets the rows of the table with new data.
	 * @param {(string | number | (string | number)[] | Record<string, string | number>)[]} data The new data array.
	 * @param {boolean} [reuse=false] Whether to try to reuse existing row elements (optimization).
	 */
	setRows(data: (string | number | (string | number)[] | Record<string, string | number>)[],
		reuse: boolean = false)
	{
		this.data = data;
		this.updateContent(reuse);
	}

	/**
	 * Adds a single row to the table.
	 * @param {string | number | (string | number)[] | Record<string, string | number>} row The data for the row.
	 * @param {boolean} skipAdd If true, does not add the row to the internal data array (used when rebuilding from existing data).
	 * @returns {HTMLTableRowElement} The created row element.
	 */
	addRow(row: string | number | (string | number)[] | Record<string, string | number>,
		skipAdd: boolean): HTMLTableRowElement
	{
		const tr = document.createElement("tr");

		// Create cells
		for (let j = 0; j < this.columnFields.length; ++j)
		{
			const td = document.createElement("td");

			let value: string | string[] | Record<string, string | number> | undefined | number;

			if (Array.isArray(row))
			{
				value = row[j];
			}
			else // Object
			{
				value = row[this.columnFields[j] as keyof object];
			}
			value = value ?? "";

			td.innerHTML = value as string;
			this.value = this.columnFields[j];

			const column = this.columns[j] as TableColumn;
			if (column === undefined) { break; }
			if (column.className) { td.className = column.className; }
			if (column.width) { td.style.width = column.width as string; }
			tr.appendChild(td);
		}

		this.root.appendChild(tr);
		this.rows.push(tr);
		if (!skipAdd) { this.data.push(row); }

		return tr;
	}

	/**
	 * Updates an existing row with new data.
	 * @param {number} index The index of the row to update.
	 * @param {string | number | (string | number)[] | Record<string, string | number>} row The new data for the row.
	 * @returns {HTMLTableRowElement | undefined} The updated row element, or undefined if not found.
	 */
	updateRow(index: number,
		row: string | number | (string | number)[] | Record<string, string | number>)
	{
		this.data[index] = row;

		const tr = this.rows[index];
		if (!tr)
		{ return; }

		const cells = tr.querySelectorAll("td");
		for (let j = 0; j < cells.length; ++j)
		{
			const column = this.columns[j];

			let value: string | number | string[] | Record<string, string | number> | undefined;

			if (Array.isArray(row))
			{
				value = row[j];
			}
			else
			{
				value = row[column.field as keyof object];
			}

			value = value ?? "";

			cells[j].innerHTML = value as string;
		}
		return tr;
	}

	/**
	 * Updates the content of a specific cell.
	 * @param {number} row The row index.
	 * @param {number} cell The cell (column) index.
	 * @param {string} data The new HTML content.
	 * @returns {HTMLElement | undefined} The updated cell element, or undefined if not found.
	 */
	updateCell(row: number, cell: number, data: string)
	{
		const tr = this.rows[row];
		if (!tr) { return; }
		const newCell = tr.childNodes[cell] as HTMLElement | null;
		if (!newCell) { return; }
		newCell.innerHTML = data;
		return newCell;
	}


	/**
	 * Defines the columns for the table.
	 * @param {(string | number | TableColumn)[]} columns Array of column names or definitions.
	 */
	setColumns(columns: (string | number | TableColumn)[])
	{
		this.columns.length = 0;
		this.columnFields.length = 0;

		const avgWidth = ((Math.floor(100 / columns.length)).toFixed(1)) + "%";

		const rest = [];

		for (let i = 0; i < columns.length; ++i)
		{
			let col: string | number | object | TableColumn = columns[i];

			if (col === null || col === undefined) { continue; }

			// Allow to pass just strings or numbers instead of objects
			if (typeof col === "string" || typeof col === "number") { col = { name: String(col) }; }

			const tableCol = col as TableColumn;

			const column: TableColumn = {
				name: tableCol.name || "",
				width: SizeToCSS(tableCol.width || avgWidth) as string,
				field: (tableCol.field || tableCol.name || "").toLowerCase(),
				className: tableCol.className
			};

			// Last
			if (i == columns.length - 1)
			{
				column.width = `calc( 100% - ( ${rest.join(" + ")}) )`;
			}
			else
			{
				rest.push(column.width);
			}

			this.columns.push(column);
			this.columnFields.push(column.field as string);
		}

		this._mustUpdateHeader = true;
		this.updateContent();
	}

	/**
	 * Rebuilds or updates the table content based on the current data.
	 * @param {boolean} [reuse=false] Whether to reuse existing DOM elements.
	 */
	updateContent(reuse: boolean = false)
	{
		this.root.innerHTML = "";

		// Update header
		if (this._mustUpdateHeader)
		{
			this.header = document.createElement("tr");
			for (let i = 0; i < this.columns.length; ++i)
			{
				const column = this.columns[i] as TableColumn;
				const th = document.createElement("th");
				th.innerHTML = column.name as string;
				if (column.width)
				{
					th.style.width = column.width as string;
				}
				column.tableElement = th;
				this.header.appendChild(th);
			}
			this._mustUpdateHeader = false;
		}
		this.root.appendChild(this.header as HTMLTableRowElement);

		if (!this.data) { return; }

		if (this.data.length != this.rows.length) { reuse = false; }

		if (reuse)
		{
			for (let i = 0; i < this.rows.length; ++i)
			{
				const dataRow = this.data[i];
				const tr = this.updateRow(i, dataRow);
				this.root.appendChild(tr!);
			}
		}
		else
		{
			this.rows.length = 0;

			// Create rows
			for (let i = 0; i < this.data.length; ++i)
			{
				const row = this.data[i];
				this.addRow(row, true);
			}
		}
	}
}