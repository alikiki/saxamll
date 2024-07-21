import { EventEmitter } from "eventemitter3";
import { XMLNode } from "./types/index";
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
        // TODO: callback or event emitting function
        switch (this.state) {
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

    parse(input: string) {
        this.buffer += input;
        while (this.currIdx < this.buffer.length) {
            switch (this.buffer[this.currIdx]) {
                case "<":
                    switch (this.state) {
                        case ParserState.TEXT:
                            // Append the text node 
                            this.pushChild();

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
                        default:
                            break;
                    }
                    break;
                case "/":
                    switch (this.state) {
                        case ParserState.OPENTAG:
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
                default:
                    switch (this.state) {
                        case ParserState.TAGNAME:
                        case ParserState.OPENTAG:
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

class SaxaMLLEmitter extends EventEmitter {
    responses: string[];
    constructor() {
        super();
        this.responses = [];
    }

    onTagOpen(tagName: string, callback: (node: XMLNode) => Promise<string>) {
        const modifiedTagName = `tagOpen:${tagName}`;
        this.on(modifiedTagName, async (node: XMLNode) => {
            const response = await callback(node);
            this.responses.push(response);

            console.log(this.responses);
        });
    }

    onTagClose(tagName: string, callback: (node: XMLNode) => Promise<string>) {
        const modifiedTagName = `tagClose:${tagName}`;
        this.on(modifiedTagName, async (node: XMLNode) => {
            const response = await callback(node);
            this.responses.push(response);

            console.log(this.responses);
        });
    }

    flush(): string[] {
        const responses = this.responses;
        const cleanedResponses = responses.filter((response) => response !== "");
        this.responses = [];
        return cleanedResponses;
    }
}

export { SaxaMLLEmitter, SaxaMLLParser };
