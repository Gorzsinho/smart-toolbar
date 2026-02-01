import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { TargetStateStore } from './target-state-store';
import { Target } from './target-providers';
import { DropdownService } from 'smart-toolbar/lib/browser/smart-toolbar-api';

@injectable()
export class TargetDropdownBridge {
    protected readonly toDispose = new DisposableCollection();

    @inject(DropdownService)
    protected readonly dropdownService!: DropdownService;

    @inject(TargetStateStore)
    protected readonly targetStateStore!: TargetStateStore;

    @postConstruct()
    protected init(): void {
        void this.initAsync().catch(err =>
            console.error('[TargetDropdownBridge] init failed', err)
        );
    }

    protected async initAsync(): Promise<void> {
        // 1) Initial sync: store -> dropdown
        await this.pushStoreToDropdown();

        // 2) Store items changed -> refresh dropdown items
        this.toDispose.push(
            this.targetStateStore.onDidChangeTargets(() => {
                void this.pushStoreToDropdown().catch(console.error);
            })
        );

        // 3) Store selection changed -> update dropdown selection
        this.toDispose.push(
            this.targetStateStore.onDidChangeCurrentTargetId(id => {
                void this.dropdownService.setSelectionById(id).catch(console.error);
            })
        );

        // 4) Dropdown selection changed -> update store selection
        this.toDispose.push(
            this.dropdownService.onDidChangeSelection(sel => {
                const target = sel as Target | undefined;
                this.targetStateStore.setCurrentTargetId(target?.id);
            })
        );
    }

    protected async pushStoreToDropdown(): Promise<void> {
        const targets: Target[] = [...this.targetStateStore.getTargets()];

        // Push the domain objects directly into the dropdown (no DropdownItem mapping)
        await this.dropdownService.setItems(targets);

        const currentId = this.targetStateStore.getCurrentTargetId();
        if (currentId) {
            await this.dropdownService.setSelectionById(currentId);
        } else if (targets[0]) {
            // Optional default: select the first target
            this.targetStateStore.setCurrentTargetId(targets[0].id);
            await this.dropdownService.setSelectionById(targets[0].id);
        } else {
            await this.dropdownService.setSelectionById(undefined);
        }
    }

    dispose(): void {
        this.toDispose.dispose();
    }
}
