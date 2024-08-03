import { ParserState } from "./state";
import SaxaMLLExecutor from "./executor";
import SaxaMLLParserContextManager from "./contextManager";
import SaxaMLLParserStateManager from "./stateManager";
import { ParserError } from "./error";

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

    public update() {
        this.stateManager.flush();
    }

    public end() {
        this.stateManager.flushAll();
    }

    public setExecutor(executor: SaxaMLLExecutor) {
        this.executor = executor;
    }

    // <
    private handleLessThan(c: string) {
        switch (this.state) {
            case ParserState.ATTRVALUEREADY:
            case ParserState.ATTRKEY:
            case ParserState.TAGNAME:
            case ParserState.OPENTAG:
                // Commit whatever node has been populated so far
                const currentChild = this.contextManager.currChildNode;

                this.stateManager.commitChild();

                // Enter an error state 
                this.stateManager.setError(ParserError.UNEXPECTED_TOKEN);
                this.stateManager.transition(ParserState.ERROR);

                this.contextManager.setTagName("error");
                this.contextManager.setNodeType("error");
                this.contextManager.addToPost(c);
                this.contextManager.setContent(`Unexpected opening tag '<' after opening tag "${currentChild.tag}"`);
                break;
            case ParserState.ATTRVALUE:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            default:
                this.stateManager.transition(ParserState.OPENTAG);
        }
    }
    // >
    private handleGreaterThan(c: string) {
        switch (this.state) {
            case ParserState.ERROR:
                switch (this.stateManager.error) {
                    case ParserError.UNEXPECTED_TOKEN:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case ParserState.ATTRVALUE:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            case ParserState.ATTRKEY:
            case ParserState.TAGNAME:
                this.contextManager.addToPre(c);
                this.stateManager.transition(ParserState.OPEN);
                this.stateManager.enterScope();
                break;

            // Assumption with close tag is that you're already inside of a scope
            // This assumption isn't always true
            // For example, self-closing tags.
            case ParserState.CLOSETAG:
                this.contextManager.addToPost(c);
                this.stateManager.exitScope();
                break;
            case ParserState.CLOSETAGLONE:
                this.contextManager.addToPre(c);
                this.stateManager.tagClosed();
                break;
            case ParserState.OPENTAG:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent("<")
                this.contextManager.addToContent(c);
                break;
            case ParserState.TEXT:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }

    // /
    private handleForwardSlash(c: string) {
        switch (this.state) {
            case ParserState.ERROR:
                switch (this.stateManager.error) {
                    case ParserError.UNEXPECTED_TOKEN:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case ParserState.ATTRVALUE:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            case ParserState.ATTRKEY:
            case ParserState.TAGNAME:
                this.contextManager.addToPre(c);
                this.stateManager.transition(ParserState.CLOSETAGLONE);
                break;
            case ParserState.OPENTAG:
                // Commit whatever node has been populated so far
                this.stateManager.commitChild();
                this.contextManager.addToPost("</");
                this.stateManager.transition(ParserState.CLOSETAG);
                break;
            case ParserState.TEXT:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }

    private handleDoubleQuotation(c: string) {
        this.handleQuotation(c);
    }

    private handleSingleQuotation(c: string) {
        this.handleQuotation(c);
    }


    // ' or "
    private handleQuotation(c: string) {
        switch (this.state) {
            case ParserState.ERROR:
                switch (this.stateManager.error) {
                    case ParserError.UNEXPECTED_TOKEN:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case ParserState.OPENTAG:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent("<");
                this.contextManager.addToContent(c);
                break;
            case ParserState.ATTRVALUEREADY:
                this.contextManager.addToPre(c);
                this.contextManager.setQuoteUsedForAttrValue(c);
                this.stateManager.transition(ParserState.ATTRVALUE);
                break;
            case ParserState.IDLE:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case ParserState.TEXT:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case ParserState.ATTRVALUE:
                this.contextManager.addToPre(c);

                // Don't close the attribute if the quote used for the value is different
                if (c !== this.contextManager.currQuoteUsedForAttrValue) {
                    this.contextManager.addToAttrValue(c);
                    break;
                };

                // Push attribute to the current node
                this.contextManager.addAttr();

                this.contextManager.clearQuoteUsedForAttrValue();

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
            case ParserState.ERROR:
                switch (this.stateManager.error) {
                    case ParserError.UNEXPECTED_TOKEN:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case ParserState.ATTRKEY:
                this.contextManager.addToPre(c);
                this.stateManager.transition(ParserState.ATTRVALUEREADY);
                break;
            case ParserState.ATTRVALUE:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            case ParserState.TEXT:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }

    // Space
    private handleSpace(c: string) {
        switch (this.state) {
            case ParserState.ERROR:
                switch (this.stateManager.error) {
                    case ParserError.UNEXPECTED_TOKEN:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case ParserState.ATTRVALUEREADY:
            case ParserState.ATTRKEY:
                this.contextManager.addToPre(c);
                break;
            case ParserState.ATTRVALUE:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            case ParserState.TAGNAME:
                this.contextManager.addToPre(c);
                this.stateManager.transition(ParserState.ATTRKEY);
                break;
            case ParserState.TEXT:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case ParserState.OPENTAG:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
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
            case ParserState.ERROR:
                switch (this.stateManager.error) {
                    case ParserError.UNEXPECTED_TOKEN:
                        this.contextManager.addToPost(c);
                        break;
                    case ParserError.BAD_CLOSE_TAG:
                        this.stateManager.transition(ParserState.TEXT);
                        this.contextManager.setTagName("text");
                        this.contextManager.setNodeType("text");
                        this.contextManager.addToContent(c);
                        break;
                    default:
                        break;
                }
                break;
            case ParserState.TAGNAME:
                this.contextManager.addToPre(c);
                this.contextManager.addToTagName(c);
                break;
            case ParserState.OPENTAG:
                // Commit whatever node has been populated so far
                this.stateManager.commitChild();

                // Start a new node and start accumulating 
                this.contextManager.addToPre(`<${c}`);
                this.contextManager.addToTagName(c);
                this.stateManager.transition(ParserState.TAGNAME);
                break;
            case ParserState.CLOSETAG:
                this.contextManager.addToPost(c);
                this.contextManager.addToTagName(c);
                break;
            case ParserState.IDLE:
            case ParserState.OPEN:
                this.stateManager.transition(ParserState.TEXT);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case ParserState.TEXT:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case ParserState.ATTRKEY:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrKey(c);
                break;
            case ParserState.ATTRVALUE:
                this.contextManager.addToPre(c);
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