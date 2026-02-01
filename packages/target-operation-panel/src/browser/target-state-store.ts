import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { Target } from './target-providers';

@injectable()
export class TargetStateStore {

    private targets: Target[] = [];
    private currentTargetId?: string;

    private connectedByTarget = new Map<string, boolean>();

    private readonly targetsEmitter = new Emitter<ReadonlyArray<Target>>();
    readonly onDidChangeTargets: Event<ReadonlyArray<Target>> =
        this.targetsEmitter.event;

    private readonly currentTargetEmitter = new Emitter<string | undefined>();
    readonly onDidChangeCurrentTargetId: Event<string | undefined> =
        this.currentTargetEmitter.event;

    private readonly connectionEmitter = new Emitter<{ targetId: string; connected: boolean }>();
    readonly onDidChangeConnection:
        Event<{ targetId: string; connected: boolean }> =
        this.connectionEmitter.event;

    getTargets(): ReadonlyArray<Target> {
        return this.targets;
    }

    setTargets(targets: ReadonlyArray<Target>): void {
        const changed = !this.sameTargets(this.targets, targets);
        if (!changed) {
            return;
        }

        this.targets = [...targets];
        this.targetsEmitter.fire(this.targets);

        // If the current target became invalid, set a default one
        if (this.currentTargetId &&
            !this.targets.some(t => t.id === this.currentTargetId)) {
            this.setCurrentTargetId(this.targets[0]?.id);
        }
    }

    getCurrentTargetId(): string | undefined {
        return this.currentTargetId;
    }

    setCurrentTargetId(id: string | undefined): void {
        if (id === this.currentTargetId) {
            return;
        }

        this.currentTargetId = id;
        this.currentTargetEmitter.fire(this.currentTargetId);
    }

    isConnectedForCurrentTarget(): boolean {
        const id = this.currentTargetId;
        if (!id) {
            return false;
        }
        return this.connectedByTarget.get(id) === true;
    }

    isConnected(targetId: string): boolean {
        return this.connectedByTarget.get(targetId) === true;
    }

    setConnectedForCurrentTarget(connected: boolean): void {
        const id = this.currentTargetId;
        if (!id) {
            return;
        }
        this.setConnected(id, connected);
    }

    setConnected(targetId: string, connected: boolean): void {
        const prev = this.connectedByTarget.get(targetId) === true;
        if (prev === connected) {
            return;
        }

        this.connectedByTarget.set(targetId, connected);
        this.connectionEmitter.fire({ targetId, connected });
    }

    private sameTargets(a: ReadonlyArray<Target>, b: ReadonlyArray<Target>): boolean {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i].id !== b[i].id) {
                return false;
            }
        }
        return true;
    }
}
