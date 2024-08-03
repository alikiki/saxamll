import { XMLNode } from "../types/index";
import XMLNodeDescription from "../node/index";
import EventEmitter from "../../node_modules/eventemitter3/index";

type SaxaMLLEventType = "tagOpen" | "tagClose" | "update";
type SaxaMLLEventCallback = (node: XMLNode) => any;

class ExecutionHandlerBuilder {
    public executor: SaxaMLLExecutor;
    public eventType: SaxaMLLEventType;
    public tag?: XMLNodeDescription | string;
    public scope: string[] = [];

    constructor(executor: SaxaMLLExecutor, eventType: SaxaMLLEventType) {
        this.executor = executor;
        this.eventType = eventType;
    }

    public for(tag: XMLNodeDescription | string): ExecutionHandlerBuilderWithFor {
        this.tag = tag;
        return new ExecutionHandlerBuilderWithFor(this);
    }

    public do(callback: SaxaMLLEventCallback) {
        this.executor.addHandler(this.eventType, "", callback);
    }

    public getEventName(): string {
        return this.executor.buildEventName(this.eventType, this.tag!);
    }
}

class ExecutionHandlerBuilderWithFor {
    private builder: ExecutionHandlerBuilder;

    constructor(builder: ExecutionHandlerBuilder) {
        this.builder = builder;
    }

    public do(callback: SaxaMLLEventCallback) {
        this.builder.executor.addHandler(this.builder.eventType, this.builder.tag!, callback);

        return this;
    }

    public getEventName(): string {
        return this.builder.getEventName();
    }
}



export default class SaxaMLLExecutor extends EventEmitter {
    constructor() {
        super();
    }

    public buildEventName(event: SaxaMLLEventType, tag: XMLNodeDescription | string): string {
        const modifiedTag = tag instanceof XMLNodeDescription ? tag.tag : tag;
        if (modifiedTag.length === 0) return event;

        return `${event}:${modifiedTag}`;
    }


    public upon(event: SaxaMLLEventType) {
        return new ExecutionHandlerBuilder(this, event);
    }


    public addHandler(event: SaxaMLLEventType, tag: XMLNodeDescription | string, callback: SaxaMLLEventCallback) {
        const eventName = this.buildEventName(event, tag);

        super.on(eventName, callback);
    }
}

export { ExecutionHandlerBuilder };