import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { ToolbarContribution, ToolbarItemRegistry } from 'smart-toolbar/lib/browser/toolbar-contribution';
import { SmartToolbarMenus } from 'smart-toolbar/lib/browser/smart-toolbar-api';
import { ApplicationShell, BoxLayout, FrontendApplication, Panel, Widget, WidgetManager } from '@theia/core/lib/browser';
import { TargetStateStore } from './target-state-store';
import { SMART_TOOLBAR_ID } from 'smart-toolbar/lib/browser/smart-toolbar-api';
import './style/strip-panel.css';

const TargetCommands = {
    CONNECT: {
        id: 'connection.connect',
        label: 'Connect'
    },
    DISCONNECT: {
        id: 'connection.disconnect',
        label: 'Disconnect'
    },
    DO_SOMETHING: {
        id: 'otherext.doSomething',
        label: 'Do something'
    },
    OPEN_SETTINGS: {
        id: 'otherext.openSettings',
        label: 'Settings'
    }
};

@injectable()
export class TargetOperationPanelContribution implements CommandContribution, ToolbarContribution, MenuContribution {

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    @inject(TargetStateStore)
    protected readonly targetStateStore: TargetStateStore;

    async onStart(app: FrontendApplication): Promise<void> {
        await this.addTargetOperationPanel(app.shell);

        this.targetStateStore.setTargets([
            { id: 'dev', configuration: 'Development', resource: 'Local' },
            { id: 'test', configuration: 'Test', resource: 'Local' },
            { id: 'prod', configuration: 'Production', resource: 'Local' }
        ]);
        this.targetStateStore.setCurrentTargetId('dev');
    }

    protected async addTargetOperationPanel(shell: ApplicationShell): Promise<void> {
        const smartToolbar = await this.widgetManager.getOrCreateWidget(SMART_TOOLBAR_ID);

        // 1) Create a strip panel (Lumino) and place the Theia/React widget inside it
        const strip = new Panel();
        strip.id = 'strip-panel';
        strip.addClass('strip-panel');

        // Make the smart toolbar fill the strip
        smartToolbar.node.style.width = '100%';
        strip.addWidget(smartToolbar);

        // 2) Insert into the shell BoxLayout right after the topPanel
        const layout = shell.layout as BoxLayout | undefined;
        if (!layout) {
            console.warn('[SmartToolbar] shell.layout not found');
            return;
        }

        const widgets = Array.from(layout.widgets) as Widget[];
        const topIndex = widgets.indexOf(shell.topPanel);

        if (topIndex < 0) {
            console.warn('[StripPanel] topPanel not found in shell BoxLayout.widgets');
            return;
        }

        // Avoid inserting the strip multiple times (e.g. reload / layout restore)
        if (widgets.includes(strip)) {
            return;
        }

        // Perform the actual insertion
        layout.insertWidget(topIndex + 1, strip);

        BoxLayout.setStretch(strip, 0);

        // 4) Refresh
        strip.update();
        shell.update();
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(TargetCommands.CONNECT, {
            execute: () => this.targetStateStore.setConnectedForCurrentTarget(true),
            isVisible: () => !this.targetStateStore.isConnectedForCurrentTarget()
        });

        registry.registerCommand(TargetCommands.DISCONNECT, {
            execute: () => this.targetStateStore.setConnectedForCurrentTarget(false),
            isVisible: () => this.targetStateStore.isConnectedForCurrentTarget()
        });

        registry.registerCommand(TargetCommands.DO_SOMETHING, {
            execute: () => {
                console.log('Do something executed1');
            }
        });

        registry.registerCommand(TargetCommands.OPEN_SETTINGS, {
            execute: () => {
                console.log('Open settings executed');
            }
        });
    }

    registerToolbarItems(registry: ToolbarItemRegistry): void {
        registry.registerItem({
            commandId: TargetCommands.CONNECT.id,
            icon: 'plug',
            tooltip: 'Connect',
            order: 10
        });

        registry.registerItem({
            commandId: TargetCommands.DISCONNECT.id,
            icon: 'debug-disconnect',
            tooltip: 'Disconnect',
            order: 20
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(SmartToolbarMenus.MORE_MENU, {
            commandId: TargetCommands.DO_SOMETHING.id,
            order: '010'
        });

        menus.registerMenuAction(SmartToolbarMenus.MORE_MENU, {
            commandId: TargetCommands.OPEN_SETTINGS.id,
            order: '020'
        });
    }
}