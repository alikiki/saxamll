import { XMLNode } from "../types/index";
import XMLNodeDescription from "../node/index";
import EventEmitter from "eventemitter3";
type SaxaMLLTagEventType = "tagOpen" | "tagClose";
type SaxaMLLUpdateEventType = "update";
type SaxaMLLEventType = SaxaMLLTagEventType | SaxaMLLUpdateEventType;
type SaxaMLLTagEventCallback = (node: XMLNode) => any;
type SaxaMLLUpdateEventCallback = (args: [parent: XMLNode, child: XMLNode, isCommittedToParent: boolean]) => any;
type SaxaMLLEventTypeToCallback = {
    [K in SaxaMLLEventType]: K extends SaxaMLLTagEventType ? SaxaMLLTagEventCallback : SaxaMLLUpdateEventCallback;
};
declare class ExecutionHandlerBuilder<T extends SaxaMLLEventType> {
    private executor;
    private eventType;
    private tag;
    constructor(executor: SaxaMLLExecutor, eventType: T, tag?: XMLNodeDescription | string);
    for(tag: XMLNodeDescription | string): this;
    do(callback: SaxaMLLEventTypeToCallback[T]): void;
    getEventName(): string;
}
export default class SaxaMLLExecutor extends EventEmitter {
    constructor();
    buildEventName(event: SaxaMLLEventType, tag: XMLNodeDescription | string): string;
    upon<T extends SaxaMLLEventType>(event: T): ExecutionHandlerBuilder<T>;
    onTagOpen(): ExecutionHandlerBuilder<"tagOpen">;
    onTagClose(): ExecutionHandlerBuilder<"tagClose">;
    onUpdate(): ExecutionHandlerBuilder<"update">;
    addHandler<T extends SaxaMLLEventType>(event: T, tag: XMLNodeDescription | string, callback: SaxaMLLEventTypeToCallback[T]): void;
}
export { ExecutionHandlerBuilder };
//# sourceMappingURL=executor.d.ts.map