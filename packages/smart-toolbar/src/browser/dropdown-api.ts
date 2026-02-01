import { Event } from '@theia/core/lib/common/event';

export interface DropdownItem {
  id: string;
  label: string;
}

export const SMART_TOOLBAR_ID = 'smart-toolbar-widget'

export const DropdownService = Symbol('DropdownService');

export interface DropdownService {
  getItems(): Promise<ReadonlyArray<DropdownItem>>;
  setItems(items: ReadonlyArray<DropdownItem>): Promise<void>;

  getSelection(): Promise<DropdownItem | undefined>;
  setSelection(itemId: string | undefined): Promise<void>;

  readonly onDidChangeSelection: Event<DropdownItem | undefined>;
}
