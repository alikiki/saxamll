import { EventEmitter } from "eventemitter3";
import { XMLNode } from "./types/index";
import { XMLNodeDescription } from "./description";
/**
 * Parser for an XML-like DSL that Claude is prompted to use.
 * 
 * Example: 
 * <question></question>
 * <answer></answer>
 */

export const enum ParserState {
    IDLE = 0,
    OPEN = 1,
    OPENTAG = 2,
    CLOSETAG = 3,
    TAGNAME = 4,
    ATTRKEY = 5,
    ATTRVALUEREADY = 6,
    ATTRVALUE = 7,
    TEXT = 8,
    ERROR = 9
}

interface StackNode {
    node: XMLNode;
    state: ParserState;
}



abstract class SaxaMLLParserState {
    abstract toIdle(): void;
    abstract toOpen(): void;
    abstract toOpenTag(): void;
    abstract toCloseTag(): void;
    abstract toTagName(): void;
    abstract toAttrKey(): void;
    abstract toAttrValueReady(): void;
    abstract toAttrValue(): void;
    abstract toText(): void;
}

class IdleState extends SaxaMLLParserState {
    toIdle() { }
    toOpen() { }
    toOpenTag() { }
    toCloseTag() { }
    toTagName() { }
    toAttrKey() { }
    toAttrValueReady() { }
    toAttrValue() { }
    toText() { }
}

class SaxaMLLParser {
    state: ParserState;
    buffer: string;
    currIdx: number;

    // Collector states
    currChildNode: XMLNode;
    currAttrKey: string;
    currAttrValue: string;

    // AST states
    ast: XMLNode;
    stack: StackNode[];

    // Event emitter
    emitter: SaxaMLLEmitter;

    constructor() {
        this.state = ParserState.IDLE;
        this.buffer = "";
        this.currAttrKey = "";
        this.currAttrValue = "";
        this.currIdx = 0;

        // Initialize the AST
        this.ast = {
            tag: "root",
            attributes: {},
            children: [],
        }

        // Collector for the current child node
        this.currChildNode = {
            tag: "",
            attributes: {},
            children: [],
            content: ""
        }

        // Initialize the stack
        this.stack = [{
            node: this.ast,
            state: ParserState.IDLE
        }];

        // Initialize the event emitter
        this.emitter = new SaxaMLLEmitter();
    }

    flush() {
        this.state = ParserState.IDLE;
        this.buffer = "";
        this.currIdx = 0;
        this.currAttrKey = "";
        this.currAttrValue = "";
        this.currChildNode = {
            tag: "",
            attributes: {},
            children: [],
            content: ""
        };
        this.ast = {
            tag: "root",
            attributes: {},
            children: []
        };
        this.stack = [{
            node: this.ast,
            state: ParserState.IDLE
        }];
    }

    flushCurrChildNode() {
        this.currChildNode = {
            tag: "",
            attributes: {},
            children: [],
            content: ""
        };
    }

    assignEmitter(emitter: SaxaMLLEmitter) {
        this.emitter = emitter;
    }

    setCurrTagName(tagName: string) {
        this.currChildNode.tag = tagName;
    }

    addToContent() {
        this.currChildNode.content += this.buffer[this.currIdx];
    }

    addToTagName() {
        this.currChildNode.tag += this.buffer[this.currIdx];
    }

    addToAttrKey() {
        this.currAttrKey += this.buffer[this.currIdx];
    }
    addToAttrValue() {
        this.currAttrValue += this.buffer[this.currIdx];
    }
    addToAttr() {
        this.currChildNode.attributes[this.currAttrKey] = this.currAttrValue;
        this.currAttrKey = "";
        this.currAttrValue = "";
    }

    pushChild() {
        switch (this.state) {
            case ParserState.OPENTAG:
                if ((this.stack[this.stack.length - 1].node.tag === "root") || (this.currChildNode.tag.length === 0)) break;
            case ParserState.TEXT:
                // Text nodes must have no children.
                this.stack[this.stack.length - 1].node.children.push(this.currChildNode);
                break;
            default:
                this.stack[this.stack.length - 1].node.children.push(this.currChildNode);

                // Push onto the stack to append children
                this.stack.push({
                    node: this.currChildNode,
                    state: this.state
                });
                break;
        }

        console.log(this.stack[this.stack.length - 1].node);

        // Emit an event that a opening tag has been parsed
        const modifiedTagName = `tagOpen:${this.currChildNode.tag}`;
        this.emitter.emit(modifiedTagName, this.currChildNode);

        // Empty out the collector 
        this.flushCurrChildNode();
    }

    popAndGetState() {
        if (this.stack.length === 1) {
            return ParserState.IDLE;
        }

        // Emit an event that a closing tag has been parsed
        const topNode = this.stack.pop();
        const modifiedTagName = `tagClose:${topNode?.node.tag}`;
        this.emitter.emit(modifiedTagName, topNode?.node);

        // Return the state of the parent node
        return this.stack[this.stack.length - 1].state;
    }

    end() {
        // Push the last child node
        this.pushChild();

        // Pop until the stack is empty
        while (this.stack.length > 1) {
            this.popAndGetState();
        }
    }

    parse(input: string) {
        this.buffer += input;
        while (this.currIdx < this.buffer.length) {
            switch (this.buffer[this.currIdx]) {
                case "<":
                    switch (this.state) {
                        case ParserState.TEXT:
                            // Don't push the child yet - wait for the next character

                            // Start a new node
                            this.state = ParserState.OPENTAG;
                            break;
                    }
                    this.state = ParserState.OPENTAG;
                    break;
                case ">":
                    switch (this.state) {
                        case ParserState.ATTRKEY:
                        case ParserState.TAGNAME:
                            this.state = ParserState.OPEN;
                            this.pushChild();
                            break;
                        case ParserState.CLOSETAG:
                            this.state = this.popAndGetState();
                            break;
                        case ParserState.OPENTAG:
                            this.state = ParserState.TEXT;
                            this.currChildNode.tag = "text";
                            this.currChildNode.content += "<";
                            break;
                        case ParserState.TEXT:
                            this.addToContent();
                            break;
                        default:
                            break;
                    }
                    break;
                case "/":
                    switch (this.state) {
                        case ParserState.OPENTAG:
                            this.pushChild();
                            this.state = ParserState.CLOSETAG;
                            break;
                        case ParserState.TEXT:
                            this.addToContent();
                            break;
                        default:
                            break;
                    }
                    break;
                case " ":
                    switch (this.state) {
                        case ParserState.ATTRVALUE:
                            this.addToAttrValue();
                            break;
                        case ParserState.TAGNAME:
                            this.state = ParserState.ATTRKEY;
                            break;
                        case ParserState.TEXT:
                            this.addToContent();
                            break;
                        case ParserState.OPENTAG:
                            this.state = ParserState.TEXT;
                            this.currChildNode.tag = "text";
                            this.currChildNode.content += "<";
                            this.addToContent();
                            break;
                        default:
                            break;
                    }
                    break;
                case "=":
                    switch (this.state) {
                        case ParserState.ATTRKEY:
                            this.state = ParserState.ATTRVALUEREADY;
                            break;
                        case ParserState.TEXT:
                            this.addToContent();
                            break;
                        default:
                            break;
                    }
                    break;
                case '"':
                    switch (this.state) {
                        case ParserState.ATTRVALUEREADY:
                            this.state = ParserState.ATTRVALUE;
                            break;
                        case ParserState.TEXT:
                            this.addToContent();
                            break;
                        case ParserState.ATTRVALUE:
                            // Push attribute to the current node
                            this.addToAttr();

                            // Wait for another attribute key
                            this.state = ParserState.ATTRKEY;
                            break;
                        default:
                            break;
                    }
                    break;

                // a-z, A-Z, 0-9
                default:
                    switch (this.state) {
                        case ParserState.TAGNAME:
                            this.addToTagName();
                            break;
                        case ParserState.OPENTAG:
                            // Add 
                            this.pushChild();
                            this.addToTagName();
                            this.state = ParserState.TAGNAME;
                            break;
                        case ParserState.IDLE:
                        case ParserState.OPEN:
                            this.state = ParserState.TEXT;
                            this.setCurrTagName("text");
                            this.addToContent();
                            break;
                        case ParserState.TEXT:
                            this.addToContent();
                            break;
                        case ParserState.ATTRKEY:
                            this.addToAttrKey();
                            break;
                        case ParserState.ATTRVALUE:
                            this.addToAttrValue();
                            break;
                        default:
                            break;
                    }
            }
            this.currIdx++;
        }
    }
}

type SaxaMLLEventType = "tagOpen" | "tagClose";
type SaxaMLLEventCallback = (node: XMLNode) => void;

class SaxaMLLEmitter extends EventEmitter {
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

export { SaxaMLLEmitter, SaxaMLLParser };
