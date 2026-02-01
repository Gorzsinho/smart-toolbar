
export const ToolbarContribution = Symbol('ToolbarContribution');

export interface ToolbarItem {
    /** Theia command id */
    commandId: string;

    /** Codicon class name WITHOUT the "codicon-" prefix, e.g. "play", "refresh" */
    icon: string;

    /** Tooltip */
    tooltip?: string;

    /** Sort order (ascending) */
    order?: number;

    /** Optional: extra css class for styling/grouping */
    className?: string;

    /** Optional: command args */
    args?: unknown[];
}

export class ToolbarItemRegistry {
    protected readonly _items: ToolbarItem[] = [];

    registerItem(item: ToolbarItem): void {
        this._items.push(item);
    }

    get items(): readonly ToolbarItem[] {
        return this._items;
    }
}

export interface ToolbarContribution {
    registerToolbarItems(registry: ToolbarItemRegistry): void;
}
