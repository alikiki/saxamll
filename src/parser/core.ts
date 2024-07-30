import { ParserState } from "./state";
import SaxaMLLExecutor from "./executor";
import SaxaMLLParserContextManager from "./contextManager";
import SaxaMLLParserStateManager from "./stateManager";

export default class SaxaMLLParser {
    private buffer: string = "";
    private currIdx: number = 0;

    public executor: SaxaMLLExecutor = new SaxaMLLExecutor();

    private contextManager: SaxaMLLParserContextManager = new SaxaMLLParserContextManager(this.executor);

    private stateManager: SaxaMLLParserStateManager = new SaxaMLLParserStateManager(this.contextManager, this.executor);


    public get ast() {
        return this.stateManager.ast;
    }

    public get state() {
        return this.stateManager.state;
    }

    public get stack() {
        return this.stateManager.stack;
    }


    public parse(input: string) {
        this.buffer += input;
        while (this.currIdx < this.buffer.length) {
            const char = this.buffer[this.currIdx];;
            this.parseChar(char);
            this.currIdx++;
        }
    }

    public end() {
        this.stateManager.flush();
    }

    public setExecutor(executor: SaxaMLLExecutor) {
        this.executor = executor;
    }

    // <
    private handleLessThan(c: string) {
        this.stateManager.transition(ParserState.OPENTAG);
    }
    // >
    private handleGreaterThan(c: string) {
        switch (this.state) {
            case ParserState.ATTRKEY:
            case ParserState.TAGNAME:
                this.stateManager.transition(ParserState.OPEN);
                this.stateManager.enterScope();
                break;

            // Assumption with close tag is that you're already inside of a scope
            // This assumption isn't always true
            // For example, self-closing tags.
            case ParserState.CLOSETAG:
                this.stateManager.exitScope();
                break;
            case ParserState.CLOSETAGLONE:
                this.stateManager.tagClosed();
                break;
            case ParserState.OPENTAG:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.addToContent("<")
                this.contextManager.addToContent(c);
                break;
            case ParserState.TEXT:
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }

    // /
    private handleForwardSlash(c: string) {
        switch (this.state) {
            case ParserState.ATTRKEY:
            case ParserState.TAGNAME:
                this.stateManager.transition(ParserState.CLOSETAGLONE);
                break;
            case ParserState.OPENTAG:
                this.stateManager.commitChild();
                this.stateManager.transition(ParserState.CLOSETAG);
                break;
            case ParserState.TEXT:
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }

    // '
    private handleSingleQuotation(c: string) {
        switch (this.state) {
            case ParserState.OPENTAG:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.addToContent("<");
                this.contextManager.addToContent(c);
                break;
            case ParserState.ATTRVALUEREADY:
                this.stateManager.transition(ParserState.ATTRVALUE);
                break;
            case ParserState.TEXT:
                this.contextManager.addToContent(c);
                break;
            case ParserState.ATTRVALUE:
                // Push attribute to the current node
                this.contextManager.addAttr();

                // Wait for another attribute key
                this.stateManager.transition(ParserState.ATTRKEY);
                break;
            default:
                break;
        }
    }

    // "
    private handleDoubleQuotation(c: string) {
        switch (this.state) {
            case ParserState.OPENTAG:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.addToContent("<");
                this.contextManager.addToContent(c);
                break;
            case ParserState.ATTRVALUEREADY:
                this.stateManager.transition(ParserState.ATTRVALUE);
                break;
            case ParserState.TEXT:
                this.contextManager.addToContent(c);
                break;
            case ParserState.ATTRVALUE:
                // Push attribute to the current node
                this.contextManager.addAttr();

                // Wait for another attribute key
                this.stateManager.transition(ParserState.ATTRKEY);
                break;
            default:
                break;
        }
    }

    // =
    private handleEqualSign(c: string) {
        switch (this.state) {
            case ParserState.ATTRKEY:
                this.stateManager.transition(ParserState.ATTRVALUEREADY);
                break;
            case ParserState.TEXT:
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }

    // Space
    private handleSpace(c: string) {
        switch (this.state) {
            case ParserState.ATTRVALUE:
                this.contextManager.addToAttrValue(c);
                break;
            case ParserState.TAGNAME:
                this.stateManager.transition(ParserState.ATTRKEY);
                break;
            case ParserState.TEXT:
                this.contextManager.addToContent(c);
                break;
            case ParserState.OPENTAG:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.addToContent("<");
                this.contextManager.addToContent(c);
                break;
            default:
                break
        }
    }

    // a-z A-Z
    private handleAlphabet(c: string) {
        this.handleDefault(c);
    }

    // 0-9
    private handleNumber(c: string) {
        this.handleDefault(c);
    }

    // Default
    private handleDefault(c: string) {
        switch (this.state) {
            case ParserState.TAGNAME:
                this.contextManager.addToTagName(c);
                break;
            case ParserState.OPENTAG:
                this.stateManager.commitChild();
                this.contextManager.addToTagName(c);
                this.stateManager.transition(ParserState.TAGNAME);
                break;
            case ParserState.CLOSETAG:
                this.contextManager.addToTagName(c);
                break;
            case ParserState.ERROR:
            case ParserState.IDLE:
            case ParserState.OPEN:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.addToContent(c);
                break;
            case ParserState.TEXT:
                this.contextManager.addToContent(c);
                break;
            case ParserState.ATTRKEY:
                this.contextManager.addToAttrKey(c);
                break;
            case ParserState.ATTRVALUE:
                this.contextManager.addToAttrValue(c);
                break;
            default:
                break;
        }
    }

    private parseChar(char: string) {
        switch (char) {
            case "<":
                this.handleLessThan(char);
                break;
            case ">":
                this.handleGreaterThan(char);
                break;
            case "/":
                this.handleForwardSlash(char);
                break;
            case " ":
                this.handleSpace(char);
                break;
            case "=":
                this.handleEqualSign(char);
                break;
            case "'":
                this.handleSingleQuotation(char);
                break;
            case '"':
                this.handleDoubleQuotation(char);
                break;
            default:
                if (char.match(/[a-zA-Z]/)) {
                    this.handleAlphabet(char);
                } else if (char.match(/[0-9]/)) {
                    this.handleNumber(char);
                } else {
                    this.handleDefault(char);
                }
        }
    }
}