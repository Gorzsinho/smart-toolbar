// DropdownView.tsx
import * as React from 'react';
import { DropdownService, DropdownItem } from './dropdown-api';

export function DropdownWidget(props: { service: DropdownService }) {
    const { service } = props;
    const [items, setItems] = React.useState<DropdownItem[]>([]);
    const [selection, setSelection] = React.useState<DropdownItem | undefined>(undefined);

    React.useEffect(() => {
        let disposed = false;

        (async () => {
            const it = await service.getItems();
            const sel = await service.getSelection();
            if (!disposed) {
                setItems([...it]);
                setSelection(sel);
            }
        })();

        const disposeSelection = service.onDidChangeSelection(sel => setSelection(sel));

        // ha van onDidChangeItems evented is:
        // const disposeItems = service.onDidChangeItems(it => setItems([...it]));

        return () => {
            disposed = true;
            disposeSelection.dispose();
            // disposeItems.dispose();
        };
    }, [service]);

    return (
        <select
            value={selection?.id ?? ''}
            onChange={e => service.setSelection(e.currentTarget.value || undefined)}
        >
            <option value="">-- válassz --</option>
            {items.map(i => (
                <option key={i.id} value={i.id}>{i.label}</option>
            ))}
        </select>
    );
}
