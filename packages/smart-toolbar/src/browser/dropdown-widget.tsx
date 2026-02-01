import * as React from 'react';
import { DropdownIdProvider, DropdownLabelProvider, DropdownService } from './smart-toolbar-api';

type Props = {
    service: DropdownService;
    idProvider: DropdownIdProvider;
    labelProvider: DropdownLabelProvider;
    placeholder?: string;
};

export function DropdownWidget(props: Props): React.ReactElement {
    const { service, idProvider, labelProvider } = props;

    const [items, setItems] = React.useState<ReadonlyArray<unknown>>([]);
    const [selectionId, setSelectionId] = React.useState<string>('');

    React.useEffect(() => {
        let disposed = false;

        (async () => {
            const it = await service.getItems();
            const sel = await service.getSelection();
            if (!disposed) {
                setItems(it);
                setSelectionId(sel ? idProvider.getId(sel) : '');
            }
        })();

        const disposable = service.onDidChangeSelection(sel => {
            setSelectionId(sel ? idProvider.getId(sel) : '');
        });

        return () => {
            disposed = true;
            disposable.dispose();
        };
    }, [service, idProvider]);

    return (
        <select
            value={selectionId}
            onChange={e => {
                const id = e.currentTarget.value || undefined;
                setSelectionId(e.currentTarget.value);
                void service.setSelectionById(id);
            }}
            className="smart-toolbar-dropdown"
        >
            {items.map(item => {
                const id = idProvider.getId(item);
                return (
                    <option key={id} value={id}>
                        {labelProvider.getLabel(item)}
                    </option>
                );
            })}
        </select>
    );
}
