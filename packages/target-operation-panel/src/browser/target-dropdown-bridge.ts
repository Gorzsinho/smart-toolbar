import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { DropdownService, DropdownItem } from 'smart-toolbar/lib/browser/dropdown-api';
import { TargetStateStore } from './target-state-store';

@injectable()
export class TargetDropdownBridge {
    protected readonly toDispose = new DisposableCollection();

    @inject(DropdownService)
    protected readonly dropdownService!: DropdownService;

    @inject(TargetStateStore)
    protected readonly targetStateStore!: TargetStateStore;

    @postConstruct()
    protected init(): void {
        // FONTOS: ne legyen async @postConstruct
        void this.initAsync().catch(err => console.error('[TargetDropdownBridge] init failed', err));
    }

    protected async initAsync(): Promise<void> {
        // 1) induláskor store -> dropdown
        await this.pushStoreToDropdown();

        // 2) store változik -> dropdown frissít
        // (itt a te store API-dnak megfelelő event neveket használd)
        this.toDispose.push(
            this.targetStateStore.onDidChangeTargets(() => {
                void this.pushStoreToDropdown().catch(console.error);
            })
        );

        this.toDispose.push(
            this.targetStateStore.onDidChangeCurrentTargetId(id => {
                void this.dropdownService.setSelection(id).catch(console.error);
            })
        );

        // 3) dropdown selection változik -> store frissít
        this.toDispose.push(
            this.dropdownService.onDidChangeSelection(sel => {
                this.targetStateStore.setCurrentTargetId(sel?.id);
            })
        );
    }

    protected async pushStoreToDropdown(): Promise<void> {
        const items: DropdownItem[] = this.targetStateStore.getTargets().map(t => ({
            id: t.id,
            label: t.label
        }));

        await this.dropdownService.setItems(items);

        const currentId = this.targetStateStore.getCurrentTargetId();
        if (currentId) {
            await this.dropdownService.setSelection(currentId);
        } else if (items[0]) {
            // opcionális default
            this.targetStateStore.setCurrentTargetId(items[0].id);
            await this.dropdownService.setSelection(items[0].id);
        } else {
            await this.dropdownService.setSelection(undefined);
        }
    }

    dispose(): void {
        this.toDispose.dispose();
    }
}
