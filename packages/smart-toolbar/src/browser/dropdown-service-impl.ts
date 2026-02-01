import { Emitter } from '@theia/core/lib/common/event';
import { injectable } from '@theia/core/shared/inversify';
import { DropdownItem, DropdownService } from './dropdown-api';

@injectable()
export class DropdownServiceImpl implements DropdownService {
    private items: DropdownItem[] = [];
    private selection?: DropdownItem;

    private readonly selectionEmitter = new Emitter<DropdownItem | undefined>();
    readonly onDidChangeSelection = this.selectionEmitter.event;

    async getItems() { return this.items; }
    async setItems(items: ReadonlyArray<DropdownItem>) {
        this.items = [...items];
        if (this.selection && !this.items.some(i => i.id === this.selection!.id)) {
            this.selection = undefined;
            this.selectionEmitter.fire(undefined);
        }
    }

    async getSelection() { return this.selection; }
    async setSelection(itemId: string | undefined) {
        const next = itemId ? this.items.find(i => i.id === itemId) : undefined;
        if (next?.id !== this.selection?.id) {
            this.selection = next;
            this.selectionEmitter.fire(this.selection);
        }
    }
}
