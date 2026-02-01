import * as React from 'react';
import { CommandRegistry, CommandService, ContributionProvider } from '@theia/core';
import { ToolbarContribution, ToolbarItemRegistry, ToolbarItem } from './toolbar-contribution';
import './style/toolbar-widget.css';

type Props = {
    commandService: CommandService;
    commandRegistry: CommandRegistry;
    toolbarContributions: ContributionProvider<ToolbarContribution>;
};

function collectItems(toolbarContributions: ContributionProvider<ToolbarContribution>): ToolbarItem[] {
    const registry = new ToolbarItemRegistry();

    for (const contrib of toolbarContributions.getContributions()) {
        try {
            contrib.registerToolbarItems(registry);
        } catch (e) {
            console.error('[ToolbarWidget] contribution failed:', e);
        }
    }

    return [...registry.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function ToolbarWidget(props: Props): React.ReactElement {
    const { commandService, commandRegistry, toolbarContributions } = props;

    const [items, setItems] = React.useState<ToolbarItem[]>(() => collectItems(toolbarContributions));
    const [, forceRerender] = React.useReducer((x) => x + 1, 0);

    // 1) Ha a contributions dinamikusan változhatnak nálad, akkor időnként / triggerre újragyűjtöd.
    //    (Ha fix, ez elég initkor.)
    React.useEffect(() => {
        setItems(collectItems(toolbarContributions));
    }, [toolbarContributions]);

    // 2) Parancs futás után UI frissítés (enabled/visible változhat)
    React.useEffect(() => {
        const d = commandRegistry.onDidExecuteCommand(() => forceRerender());
        return () => d.dispose();
    }, [commandRegistry]);

    return (
        <div className="theia-three-button-toolbar-inline">
            {items.map((item, idx) => {
                const enabled = commandRegistry.isEnabled(item.commandId, ...(item.args ?? []));
                const visible = commandRegistry.isVisible(item.commandId, ...(item.args ?? []));

                if (!visible) {
                    return null;
                }

                return (
                    <button
                        key={`${item.commandId}-${idx}`}
                        className={`theia-button theia-toolbar-button ${item.className ?? ''}`}
                        type="button"
                        title={item.tooltip ?? ''}
                        disabled={!enabled}
                        onClick={() => commandService.executeCommand(item.commandId, ...(item.args ?? []))}
                    >
                        <span className={`codicon codicon-${item.icon}`} />
                    </button>
                );
            })}
        </div>
    );
}
