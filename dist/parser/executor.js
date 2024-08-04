import XMLNodeDescription from "../node/index";
import EventEmitter from "../../node_modules/eventemitter3/index";
class ExecutionHandlerBuilder {
    constructor(executor, eventType, tag = "") {
        this.executor = executor;
        this.eventType = eventType;
        this.tag = tag;
    }
    for(tag) {
        this.tag = tag;
        return this;
    }
    do(callback) {
        this.executor.addHandler(this.eventType, this.tag, callback);
    }
    getEventName() {
        return this.executor.buildEventName(this.eventType, this.tag);
    }
}
export default class SaxaMLLExecutor extends EventEmitter {
    constructor() {
        super();
    }
    buildEventName(event, tag) {
        const modifiedTag = tag instanceof XMLNodeDescription ? tag.tag : tag;
        return modifiedTag.length > 0 ? `${event}:${modifiedTag}` : event;
    }
    upon(event) {
        return new ExecutionHandlerBuilder(this, event);
    }
    onTagOpen() {
        return this.upon("tagOpen");
    }
    onTagClose() {
        return this.upon("tagClose");
    }
    onUpdate() {
        return this.upon("update");
    }
    addHandler(event, tag, callback) {
        const eventName = this.buildEventName(event, tag);
        super.on(eventName, callback);
    }
}
export { ExecutionHandlerBuilder };
