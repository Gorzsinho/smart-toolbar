import { ContainerModule } from '@theia/core/shared/inversify';
import { SmartToolbarWidget } from './smart-toolbar-widget';
import { FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { ToolbarContribution } from './toolbar-contribution';
import { bindContributionProvider } from '@theia/core';
import { DropdownService, SMART_TOOLBAR_ID } from './dropdown-api';
import { DropdownServiceImpl } from './dropdown-service-impl';
import { DropdownSelectionRefreshContribution } from './dropdown-selection-refresh-contribution';


export default new ContainerModule(bind => {

    bind(SmartToolbarWidget).toSelf().inSingletonScope();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: SMART_TOOLBAR_ID,
        createWidget: () => ctx.container.get(SmartToolbarWidget)
    })).inSingletonScope()

    bindContributionProvider(bind, ToolbarContribution);
    bind(DropdownService).to(DropdownServiceImpl).inSingletonScope();

    bind(DropdownSelectionRefreshContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(DropdownSelectionRefreshContribution);
});
