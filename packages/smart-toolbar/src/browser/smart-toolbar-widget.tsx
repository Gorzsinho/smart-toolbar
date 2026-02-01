import * as React from 'react'
import { inject, injectable, named, postConstruct } from '@theia/core/shared/inversify'
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget'
import { ToolbarWidget } from './toolbar-widget';
import './style/smart-toolbar-widget.css';
import { ContextMenuRenderer } from '@theia/core/lib/browser';
import { DropdownIdProvider, DropdownLabelProvider, DropdownService, SMART_TOOLBAR_ID, SmartToolbarMenus } from './smart-toolbar-api';
import { DropdownWidget } from './dropdown-widget';
import { CommandRegistry, CommandService, ContributionProvider } from '@theia/core';
import { ToolbarContribution } from './toolbar-contribution';
import './style/smart-toolbar-theme.css';


@injectable()
export class SmartToolbarWidget extends ReactWidget {

    @inject(DropdownService)
    protected readonly dropdownService: DropdownService;

    @inject(CommandService)
    protected readonly commandService!: CommandService;

    @inject(CommandRegistry)
    protected readonly commandRegistry!: CommandRegistry;

    @inject(ContributionProvider)
    @named(ToolbarContribution)
    protected readonly toolbarContributions!: ContributionProvider<ToolbarContribution>;

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(DropdownIdProvider)
    protected readonly dropdownIdProvider: DropdownIdProvider;

    @inject(DropdownLabelProvider)
    protected readonly dropdownLabelProvider: DropdownLabelProvider;

    private moreBtnRef: HTMLButtonElement | null = null;

    @postConstruct()
    protected init(): void {
        this.id = SMART_TOOLBAR_ID;
        this.title.closable = false;

        this.addClass('theia-three-button-toolbar-widget');

        this.update();
    }

    protected render(): React.ReactNode {
        console.log('Rendering SmartToolbarWidget');
        return (
            <div className="smart-toolbar-widget">
                <div className="smart-toolbar-widget__content">
                    <div className="smart-toolbar-widget__left">
                        <DropdownWidget
                            service={this.dropdownService}
                            idProvider={this.dropdownIdProvider}
                            labelProvider={this.dropdownLabelProvider} />
                    </div>

                    <div className="smart-toolbar-widget__right">
                        <ToolbarWidget
                            commandService={this.commandService}
                            commandRegistry={this.commandRegistry}
                            toolbarContributions={this.toolbarContributions}
                        />
                    </div>

                    <button
                        className="theia-button theia-toolbar-button smart-toolbar__more"
                        type="button"
                        title="More actions"
                        ref={el => (this.moreBtnRef = el)}
                        onClick={() => this.openMoreMenu()}
                    >
                        <span className="codicon codicon-ellipsis" />
                    </button>
                </div>
            </div>
        );
    }

    private openMoreMenu(): void {
        const el = this.moreBtnRef;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        this.contextMenuRenderer.render({
            menuPath: SmartToolbarMenus.MORE_MENU,
            anchor: { x: Math.round(rect.left), y: Math.round(rect.bottom) },
            context: el,
            includeAnchorArg: false
        });
    }
}
