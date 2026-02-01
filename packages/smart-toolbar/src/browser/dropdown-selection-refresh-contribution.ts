import { injectable, inject } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution, WidgetManager } from '@theia/core/lib/browser';
import { DropdownService, SMART_TOOLBAR_ID } from './smart-toolbar-api';

@injectable()
export class DropdownSelectionRefreshContribution implements FrontendApplicationContribution {

    @inject(DropdownService)
    protected readonly dropdownService: DropdownService;

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    onStart(): void {
        this.dropdownService.onDidChangeSelection(() => {
            void this.refreshSmartToolbar().catch(err =>
                console.error('[DropdownSelectionRefresh] refresh failed', err)
            );
        });
    }

    protected async refreshSmartToolbar(): Promise<void> {
        const smartToolbarWidget = await this.widgetManager.getWidget(SMART_TOOLBAR_ID);
        if (smartToolbarWidget) {
            smartToolbarWidget.update();
        }
    }
}
