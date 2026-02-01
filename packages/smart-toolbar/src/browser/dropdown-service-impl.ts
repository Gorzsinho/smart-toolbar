import { injectable, inject } from '@theia/core/shared/inversify';
import { Emitter } from '@theia/core/lib/common/event';
import { DropdownIdProvider, DropdownService } from './smart-toolbar-api';

@injectable()
export class DropdownServiceImpl implements DropdownService {
    @inject(DropdownIdProvider)
    protected readonly idProvider!: DropdownIdProvider;

    private items: unknown[] = [];
    private selectionId?: string;

    private readonly selectionEmitter = new Emitter<unknown | undefined>();
    readonly onDidChangeSelection = this.selectionEmitter.event;

    async setItems(items: ReadonlyArray<unknown>): Promise<void> {
        this.items = [...items];

        // invalid selection
        if (this.selectionId && !this.items.some(i => this.idProvider.getId(i) === this.selectionId)) {
            this.selectionId = undefined;
            this.selectionEmitter.fire(undefined);
        }
    }

    async getItems(): Promise<ReadonlyArray<unknown>> {
        return this.items;
    }

    async getSelection(): Promise<unknown | undefined> {
        if (!this.selectionId) return undefined;
        return this.items.find(i => this.idProvider.getId(i) === this.selectionId);
    }

    async setSelectionById(id: string | undefined): Promise<void> {
        if (id === this.selectionId) return;
        this.selectionId = id;
        this.selectionEmitter.fire(await this.getSelection());
    }
}
