import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { ToolbarContribution, ToolbarItemRegistry } from 'smart-toolbar/lib/browser/toolbar-contribution';
import { SmartToolbarMenus } from 'smart-toolbar/lib/browser/smart-toolbar-menus';
import { SMART_TOOLBAR_ID } from 'smart-toolbar/lib/browser/dropdown-api';
import { ApplicationShell, BoxLayout, FrontendApplication, Panel, Widget, WidgetManager } from '@theia/core/lib/browser';
import { TargetStateStore } from './target-state-store';

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
            { id: 'dev', label: 'Development' },
            { id: 'test', label: 'Test' },
            { id: 'prod', label: 'Production' }
        ]);
        this.targetStateStore.setCurrentTargetId('dev');
    }

    protected async addTargetOperationPanel(shell: ApplicationShell): Promise<void> {
        const white = await this.widgetManager.getOrCreateWidget(SMART_TOOLBAR_ID);

        // 1) Strip panel (Lumino), ebbe tesszük bele a Theia/React widgetet
        const strip = new Panel();
        strip.id = 'white-strip-panel';
        strip.addClass('white-strip-panel');

        // Fix magasság: a strip panel maga legyen 40px magas
        strip.node.style.height = '40px';
        strip.node.style.minHeight = '40px';
        strip.node.style.width = '100%';
        strip.node.style.background = '#fff';
        strip.node.style.borderBottom = '1px solid #ddd';

        // A white widget töltse ki a stripet
        white.node.style.width = '100%';
        strip.addWidget(white);

        // 2) Beszúrás a shell BoxLayoutjába a topPanel után
        const layout = shell.layout as BoxLayout | undefined;
        if (!layout) {
            console.warn('[SmartToolbar] shell.layout not found');
            return;
        }

        const widgets = Array.from(layout.widgets) as Widget[];
        const topIndex = widgets.indexOf(shell.topPanel);

        if (topIndex < 0) {
            console.warn('[WhitePanel] topPanel not found in shell BoxLayout.widgets');
            return;
        }

        // Ha már benne van egyszer, ne szúrjuk be újra (pl. reload / layout restore eset)
        if (widgets.includes(strip)) {
            return;
        }

        // tényleges beszúrás
        layout.insertWidget(topIndex + 1, strip);

        BoxLayout.setStretch(strip, 0);

        // 4) Frissítés
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