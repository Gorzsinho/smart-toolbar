import { injectable } from '@theia/core/shared/inversify';
import { DropdownIdProvider, DropdownLabelProvider } from 'smart-toolbar/lib/browser/smart-toolbar-api';

export type Target = { id: string; configuration: string; resource: string; };

@injectable()
export class TargetIdProvider implements DropdownIdProvider {
    getId(item: unknown): string {
        return (item as Target).id;
    }
}

@injectable()
export class TargetLabelProvider implements DropdownLabelProvider {
    getLabel(item: unknown): string {
        const t = item as Target;
        return `${t.configuration} - ${t.resource}`;
    }
}
