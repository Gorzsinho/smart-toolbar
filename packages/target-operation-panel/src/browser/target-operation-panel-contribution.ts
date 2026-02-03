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
        id: 'connect',
        label: 'Connect'
    },
    DISCONNECT: {
        id: 'disconnect',
        label: 'Disconnect'
    },
    BUILD: {
        id: 'build',
        label: 'Build'
    },
    LOAD: {
        id: 'load',
        label: 'Load'
    },
    START: {
        id: 'start',
        label: 'Start'
    },
    MONITOR: {
        id: 'monitor',
        label: 'Monitor'
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

    private tabRowObserver?: ResizeObserver;
    private tabRowWaitInterval?: number;

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

        // Wait until tab row is actually rendered
        this.waitForTabRowAndObserve();
    }

    protected waitForTabRowAndObserve(): void {
        console.log('[StripPanel] Waiting for tab row...');

        // Try to find it periodically until it exists
        this.tabRowWaitInterval = window.setInterval(() => {
            const tabRow = document.querySelector('.theia-tabBar-tab-row') as HTMLElement | null;

            if (!tabRow) {
                return;
            }

            console.log('[StripPanel] Tab row found, attaching ResizeObserver');
            window.clearInterval(this.tabRowWaitInterval);
            this.tabRowWaitInterval = undefined;

            // Observe size changes
            this.tabRowObserver = new ResizeObserver(() => {
                this.updateSmartToolbarLeftOffsetFromElement(tabRow);
            });

            this.tabRowObserver.observe(tabRow);

            // Initial update
            this.updateSmartToolbarLeftOffsetFromElement(tabRow);
        }, 100);
    }

    protected updateSmartToolbarLeftOffsetFromElement(tabRow: HTMLElement): void {
        const rect = tabRow.getBoundingClientRect();
        const offsetPx = Math.max(0, Math.round(rect.width)) + 8;

        console.log(`[StripPanel] Setting smart toolbar left offset to ${offsetPx}px`);
        document.documentElement.style.setProperty(
            '--smart-toolbar-left-offset',
            `${offsetPx}px`
        );
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

        registry.registerCommand(TargetCommands.BUILD, {
            execute: () => {
                console.log('Build executed');
            },
            isVisible: () => true,
            isEnabled: () => false,
        });

        registry.registerCommand(TargetCommands.START, {
            execute: () => {
                console.log('Start executed');
            }
        });

        registry.registerCommand(TargetCommands.MONITOR, {
            execute: () => {
                console.log('Monitor executed');
            }

        });

        registry.registerCommand(TargetCommands.LOAD, {
            execute: () => {
                console.log('Load executed');
            }
        });

        registry.registerCommand(TargetCommands.DO_SOMETHING, {
            execute: () => {
                console.log('Do something executed');
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

        registry.registerItem({
            commandId: TargetCommands.BUILD.id,
            icon: 'file-symlink-file',
            tooltip: 'Build',
            order: 30
        });

        registry.registerItem({
            commandId: TargetCommands.LOAD.id,
            icon: 'file',
            tooltip: 'Load',
            order: 40
        });

        registry.registerItem({
            commandId: TargetCommands.START.id,
            icon: 'play-circle',
            tooltip: 'Start',
            order: 50
        });

        registry.registerItem({
            commandId: TargetCommands.MONITOR.id,
            icon: 'pulse',
            tooltip: 'Monitor',
            order: 60
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