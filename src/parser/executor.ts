import { EventEmitter } from "eventemitter3";
import { XMLNode } from "../types/index";
import XMLNodeDescription from "../node/index";

type SaxaMLLEventType = "tagOpen" | "tagClose";
type SaxaMLLEventCallback = (node: XMLNode) => Promise<string>;

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

    public getEventName(): string {
        return this.executor.buildEventName(this.eventType, this.tag!, this.scope);
    }
}

class ExecutionHandlerBuilderWithFor {
    private builder: ExecutionHandlerBuilder;

    constructor(builder: ExecutionHandlerBuilder) {
        this.builder = builder;
    }

    public inside(...scope: string[]): ExecutionHandlerBuilderWithForAndInside {
        this.builder.scope = scope;
        return new ExecutionHandlerBuilderWithForAndInside(this.builder);
    }

    public do(callback: SaxaMLLEventCallback) {
        this.builder.executor.addHandler(this.builder.eventType, this.builder.tag!, this.builder.scope, callback);

        return this;
    }

    public getEventName(): string {
        return this.builder.getEventName();
    }
}

class ExecutionHandlerBuilderWithForAndInside {
    private builder: ExecutionHandlerBuilder;

    constructor(builder: ExecutionHandlerBuilder) {
        this.builder = builder;
    }

    public do(callback: SaxaMLLEventCallback) {
        this.builder.executor.addHandler(this.builder.eventType, this.builder.tag!, this.builder.scope, callback);

        return this;
    }

    public getEventName(): string {
        return this.builder.getEventName();
    }
}


export default class SaxaMLLExecutor extends EventEmitter {
    private executionResults: Record<string, Promise<string>> = {};

    constructor() {
        super();
    }

    public buildEventName(event: SaxaMLLEventType, tag: XMLNodeDescription | string, scope: string[]): string {
        return `${event}:${scope.join(':')}:${tag instanceof XMLNodeDescription ? tag.tag : tag}`
    }

    public on(event: SaxaMLLEventType) {
        return new ExecutionHandlerBuilder(this, event);
    }


    public addHandler(event: SaxaMLLEventType, tag: XMLNodeDescription | string, scope: string[], callback: SaxaMLLEventCallback) {
        const eventName = this.buildEventName(event, tag, scope);

        const wrapperCallback = (node: XMLNode) => {
            const eventName = this.buildEventName(event, tag, scope);
            const eventResults = callback(node);
            this.executionResults[eventName] = eventResults;
        }

        console.log(eventName);
        super.on(eventName, wrapperCallback);
    }

    public getResults(event: SaxaMLLEventType, tag: XMLNodeDescription | string, scope: string[]): Promise<string> | null {
        const eventName = this.buildEventName(event, tag, scope);
        const eventResults = this.executionResults[eventName];

        if (eventResults === undefined) {
            return null;
        }

        return eventResults;
    }

    public putResults(event: SaxaMLLEventType, tag: XMLNodeDescription | string, scope: string[]): Promise<string> | null {
        const eventName = this.buildEventName(event, tag, scope);
        const eventResults = this.executionResults[eventName];

        if (eventResults === undefined) {
            return null;
        }

        return eventResults;
    }
}

export { ExecutionHandlerBuilder };