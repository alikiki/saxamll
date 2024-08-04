import { XMLNode } from "../types/index";
import XMLNodeDescription from "../node/index";
import EventEmitter from "../../node_modules/eventemitter3/index";

type SaxaMLLTagEventType = "tagOpen" | "tagClose";
type SaxaMLLUpdateEventType = "update";
type SaxaMLLEventType = SaxaMLLTagEventType | SaxaMLLUpdateEventType;

type SaxaMLLTagEventCallback = (node: XMLNode) => any;
type SaxaMLLUpdateEventCallback = (args: [parent: XMLNode, child: XMLNode, isCommittedToParent: boolean]) => any;
type SaxaMLLEventTypeToCallback = {
    [K in SaxaMLLEventType]: K extends SaxaMLLTagEventType ? SaxaMLLTagEventCallback : SaxaMLLUpdateEventCallback;
};

type SaxaMLLEventCallback = SaxaMLLTagEventCallback | SaxaMLLUpdateEventCallback;

class ExecutionHandlerBuilder<T extends SaxaMLLEventType> {
    constructor(
        private executor: SaxaMLLExecutor,
        private eventType: T,
        private tag: XMLNodeDescription | string = ""
    ) { }

    public for(tag: XMLNodeDescription | string): this {
        this.tag = tag;
        return this;
    }

    public do(callback: SaxaMLLEventTypeToCallback[T]): void {
        this.executor.addHandler(this.eventType, this.tag, callback);
    }

    public getEventName(): string {
        return this.executor.buildEventName(this.eventType, this.tag);
    }
}

export default class SaxaMLLExecutor extends EventEmitter {
    constructor() {
        super();
    }

    public buildEventName(event: SaxaMLLEventType, tag: XMLNodeDescription | string): string {
        const modifiedTag = tag instanceof XMLNodeDescription ? tag.tag : tag;
        return modifiedTag.length > 0 ? `${event}:${modifiedTag}` : event;
    }


    public upon<T extends SaxaMLLEventType>(event: T): ExecutionHandlerBuilder<T> {
        return new ExecutionHandlerBuilder<T>(this, event);
    }

    public onTagOpen() {
        return this.upon("tagOpen");
    }

    public onTagClose() {
        return this.upon("tagClose");
    }

    public onUpdate() {
        return this.upon("update");
    }

    public addHandler<T extends SaxaMLLEventType>(
        event: T,
        tag: XMLNodeDescription | string,
        callback: SaxaMLLEventTypeToCallback[T]
    ): void {
        const eventName = this.buildEventName(event, tag);
        super.on(eventName, callback);
    }
}

export { ExecutionHandlerBuilder };