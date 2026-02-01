import { MenuPath } from '@theia/core';
import { Event } from '@theia/core/lib/common/event';

export const SMART_TOOLBAR_ID = 'smart-toolbar';
export namespace SmartToolbarMenus {
    // Other extensions will register their actions here
    export const MORE_MENU: MenuPath = ['more'];
}

export const DropdownIdProvider = Symbol('DropdownIdProvider');
export interface DropdownIdProvider {
    getId(item: unknown): string;
}

export const DropdownLabelProvider = Symbol('DropdownLabelProvider');
export interface DropdownLabelProvider {
    getLabel(item: unknown): string;
}

export const DropdownService = Symbol('DropdownService');
export interface DropdownService {
    setItems(items: ReadonlyArray<unknown>): Promise<void>;
    getItems(): Promise<ReadonlyArray<unknown>>;

    getSelection(): Promise<unknown | undefined>;
    setSelectionById(id: string | undefined): Promise<void>;

    readonly onDidChangeSelection: Event<unknown | undefined>;
}
