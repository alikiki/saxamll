import { EventEmitter } from "eventemitter3";
import { XMLNode } from "../types/index";
import { XMLNodeDescription } from "../node/index";

type SaxaMLLEventType = "tagOpen" | "tagClose";
type SaxaMLLEventCallback = (node: XMLNode) => void;

export default class SaxaMLLEmitter extends EventEmitter {
    private textBuffer: string[] = [];
    private xmlBuffer: string[] = [];

    constructor() {
        super();
    }

    addHandler(event: SaxaMLLEventType, tag: XMLNodeDescription | string, callback: SaxaMLLEventCallback) {
        const tagName = tag instanceof XMLNodeDescription ? tag.tag : tag;
        super.on(`${event}:${tagName}`, callback);
    }

    onTagOpen(tag: XMLNodeDescription | string, callback: SaxaMLLEventCallback) {
        const tagName = tag instanceof XMLNodeDescription ? tag.tag : tag;
        super.on(`tagOpen:${tagName}`, callback);
    }

    onTagClose(tag: XMLNodeDescription | string, callback: SaxaMLLEventCallback) {
        const tagName = tag instanceof XMLNodeDescription ? tag.tag : tag;
        super.on(`tagClose:${tagName}`, callback);
    }

    removeHandler(eventType: SaxaMLLEventType, tag: XMLNodeDescription | string): void {
        const tagName = tag instanceof XMLNodeDescription ? tag.tag : tag;
        super.removeAllListeners(`${eventType}:${tagName}`);
    }

    processEvent(eventType: SaxaMLLEventType, tagName: XMLNodeDescription | string, node: XMLNode) {
        const eventName = `${eventType}:${tagName}`;
        super.emit(eventName, node);
    }
}