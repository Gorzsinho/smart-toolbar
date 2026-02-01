import { ContainerModule } from '@theia/core/shared/inversify';
import { TargetOperationPanelContribution } from './target-operation-panel-contribution';
import { ToolbarContribution } from 'smart-toolbar/lib/browser/toolbar-contribution';
import { CommandContribution, MenuContribution } from '@theia/core';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { TargetStateStore } from './target-state-store';
import { TargetDropdownBridge } from './target-dropdown-bridge';
import { TargetIdProvider, TargetLabelProvider } from './target-providers';
import { DropdownIdProvider, DropdownLabelProvider } from 'smart-toolbar/lib/browser/smart-toolbar-api';


export default new ContainerModule(bind => {
    bind(TargetOperationPanelContribution).toSelf().inSingletonScope();

    bind(ToolbarContribution).toService(TargetOperationPanelContribution);
    bind(CommandContribution).toService(TargetOperationPanelContribution);
    bind(MenuContribution).toService(TargetOperationPanelContribution);
    bind(FrontendApplicationContribution).toService(TargetOperationPanelContribution);

    bind(TargetStateStore).toSelf().inSingletonScope();

    bind(TargetDropdownBridge).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(TargetDropdownBridge);

    bind(TargetIdProvider).toSelf().inSingletonScope();
    bind(DropdownIdProvider).toService(TargetIdProvider);

    bind(TargetLabelProvider).toSelf().inSingletonScope();
    bind(DropdownLabelProvider).toService(TargetLabelProvider);
});
