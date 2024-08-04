import SaxaMLLExecutor from "./executor";
import SaxaMLLParserContextManager from "./contextManager";
import SaxaMLLParserStateManager from "./stateManager";
export default class SaxaMLLParser {
    constructor() {
        this.buffer = "";
        this.currIdx = 0;
        this.executor = new SaxaMLLExecutor();
        this.contextManager = new SaxaMLLParserContextManager(this.executor);
        this.stateManager = new SaxaMLLParserStateManager(this.contextManager, this.executor);
    }
    get ast() {
        return this.stateManager.ast;
    }
    get state() {
        return this.stateManager.state;
    }
    get stack() {
        return this.stateManager.stack;
    }
    parse(input) {
        this.buffer += input;
        while (this.currIdx < this.buffer.length) {
            const char = this.buffer[this.currIdx];
            ;
            this.parseChar(char);
            this.currIdx++;
        }
    }
    update() {
        this.stateManager.flush();
    }
    end() {
        this.stateManager.flushAll();
    }
    setExecutor(executor) {
        this.executor = executor;
    }
    // <
    handleLessThan(c) {
        switch (this.state) {
            case 7 /* ParserState.ATTRVALUEREADY */:
            case 6 /* ParserState.ATTRKEY */:
            case 5 /* ParserState.TAGNAME */:
            case 2 /* ParserState.OPENTAG */:
                // Commit whatever node has been populated so far
                const currentChild = this.contextManager.currChildNode;
                this.stateManager.commitChild();
                // Enter an error state 
                this.stateManager.setError("Unexpected token" /* ParserError.UNEXPECTED_TOKEN */);
                this.stateManager.transition(10 /* ParserState.ERROR */);
                this.contextManager.setTagName("error");
                this.contextManager.setNodeType("error");
                this.contextManager.addToPost(c);
                this.contextManager.setContent(`Unexpected opening tag '<' after opening tag "${currentChild.tag}"`);
                break;
            case 8 /* ParserState.ATTRVALUE */:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            default:
                this.stateManager.transition(2 /* ParserState.OPENTAG */);
        }
    }
    // >
    handleGreaterThan(c) {
        switch (this.state) {
            case 10 /* ParserState.ERROR */:
                switch (this.stateManager.error) {
                    case "Unexpected token" /* ParserError.UNEXPECTED_TOKEN */:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case 8 /* ParserState.ATTRVALUE */:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            case 6 /* ParserState.ATTRKEY */:
            case 5 /* ParserState.TAGNAME */:
                this.contextManager.addToPre(c);
                this.stateManager.transition(1 /* ParserState.OPEN */);
                this.stateManager.enterScope();
                break;
            // Assumption with close tag is that you're already inside of a scope
            // This assumption isn't always true
            // For example, self-closing tags.
            case 3 /* ParserState.CLOSETAG */:
                this.contextManager.addToPost(c);
                this.stateManager.exitScope();
                break;
            case 4 /* ParserState.CLOSETAGLONE */:
                this.contextManager.addToPre(c);
                this.stateManager.tagClosed();
                break;
            case 2 /* ParserState.OPENTAG */:
                this.stateManager.transition(9 /* ParserState.TEXT */);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent("<");
                this.contextManager.addToContent(c);
                break;
            case 9 /* ParserState.TEXT */:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }
    // /
    handleForwardSlash(c) {
        switch (this.state) {
            case 10 /* ParserState.ERROR */:
                switch (this.stateManager.error) {
                    case "Unexpected token" /* ParserError.UNEXPECTED_TOKEN */:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case 8 /* ParserState.ATTRVALUE */:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            case 6 /* ParserState.ATTRKEY */:
            case 5 /* ParserState.TAGNAME */:
                this.contextManager.addToPre(c);
                this.stateManager.transition(4 /* ParserState.CLOSETAGLONE */);
                break;
            case 2 /* ParserState.OPENTAG */:
                // Commit whatever node has been populated so far
                this.stateManager.commitChild();
                this.contextManager.addToPost("</");
                this.stateManager.transition(3 /* ParserState.CLOSETAG */);
                break;
            case 9 /* ParserState.TEXT */:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }
    handleDoubleQuotation(c) {
        this.handleQuotation(c);
    }
    handleSingleQuotation(c) {
        this.handleQuotation(c);
    }
    // ' or "
    handleQuotation(c) {
        switch (this.state) {
            case 10 /* ParserState.ERROR */:
                switch (this.stateManager.error) {
                    case "Unexpected token" /* ParserError.UNEXPECTED_TOKEN */:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case 2 /* ParserState.OPENTAG */:
                this.stateManager.transition(9 /* ParserState.TEXT */);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent("<");
                this.contextManager.addToContent(c);
                break;
            case 7 /* ParserState.ATTRVALUEREADY */:
                this.contextManager.addToPre(c);
                this.contextManager.setQuoteUsedForAttrValue(c);
                this.stateManager.transition(8 /* ParserState.ATTRVALUE */);
                break;
            case 0 /* ParserState.IDLE */:
                this.stateManager.transition(9 /* ParserState.TEXT */);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case 9 /* ParserState.TEXT */:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case 8 /* ParserState.ATTRVALUE */:
                this.contextManager.addToPre(c);
                // Don't close the attribute if the quote used for the value is different
                if (c !== this.contextManager.currQuoteUsedForAttrValue) {
                    this.contextManager.addToAttrValue(c);
                    break;
                }
                ;
                // Push attribute to the current node
                this.contextManager.addAttr();
                this.contextManager.clearQuoteUsedForAttrValue();
                // Wait for another attribute key
                this.stateManager.transition(6 /* ParserState.ATTRKEY */);
                break;
            default:
                break;
        }
    }
    // =
    handleEqualSign(c) {
        switch (this.state) {
            case 10 /* ParserState.ERROR */:
                switch (this.stateManager.error) {
                    case "Unexpected token" /* ParserError.UNEXPECTED_TOKEN */:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case 6 /* ParserState.ATTRKEY */:
                this.contextManager.addToPre(c);
                this.stateManager.transition(7 /* ParserState.ATTRVALUEREADY */);
                break;
            case 8 /* ParserState.ATTRVALUE */:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            case 9 /* ParserState.TEXT */:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }
    // Space
    handleSpace(c) {
        switch (this.state) {
            case 10 /* ParserState.ERROR */:
                switch (this.stateManager.error) {
                    case "Unexpected token" /* ParserError.UNEXPECTED_TOKEN */:
                        this.contextManager.addToPost(c);
                    default:
                        break;
                }
                break;
            case 7 /* ParserState.ATTRVALUEREADY */:
            case 6 /* ParserState.ATTRKEY */:
                this.contextManager.addToPre(c);
                break;
            case 8 /* ParserState.ATTRVALUE */:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            case 5 /* ParserState.TAGNAME */:
                this.contextManager.addToPre(c);
                this.stateManager.transition(6 /* ParserState.ATTRKEY */);
                break;
            case 9 /* ParserState.TEXT */:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case 1 /* ParserState.OPEN */:
                this.stateManager.transition(9 /* ParserState.TEXT */);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case 2 /* ParserState.OPENTAG */:
                this.stateManager.transition(9 /* ParserState.TEXT */);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent("<");
                this.contextManager.addToContent(c);
                break;
            default:
                break;
        }
    }
    // a-z A-Z
    handleAlphabet(c) {
        this.handleDefault(c);
    }
    // 0-9
    handleNumber(c) {
        this.handleDefault(c);
    }
    // Default
    handleDefault(c) {
        switch (this.state) {
            case 10 /* ParserState.ERROR */:
                switch (this.stateManager.error) {
                    case "Unexpected token" /* ParserError.UNEXPECTED_TOKEN */:
                        this.contextManager.addToPost(c);
                        break;
                    case "Bad close tag; expected closing tag for a different tag" /* ParserError.BAD_CLOSE_TAG */:
                        this.stateManager.transition(9 /* ParserState.TEXT */);
                        this.contextManager.setTagName("text");
                        this.contextManager.setNodeType("text");
                        this.contextManager.addToContent(c);
                        break;
                    default:
                        break;
                }
                break;
            case 5 /* ParserState.TAGNAME */:
                this.contextManager.addToPre(c);
                this.contextManager.addToTagName(c);
                break;
            case 2 /* ParserState.OPENTAG */:
                // Commit whatever node has been populated so far
                this.stateManager.commitChild();
                // Start a new node and start accumulating 
                this.contextManager.addToPre(`<${c}`);
                this.contextManager.addToTagName(c);
                this.stateManager.transition(5 /* ParserState.TAGNAME */);
                break;
            case 3 /* ParserState.CLOSETAG */:
                this.contextManager.addToPost(c);
                this.contextManager.addToTagName(c);
                break;
            case 0 /* ParserState.IDLE */:
            case 1 /* ParserState.OPEN */:
                this.stateManager.transition(9 /* ParserState.TEXT */);
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case 9 /* ParserState.TEXT */:
                this.contextManager.setTagName("text");
                this.contextManager.setNodeType("text");
                this.contextManager.addToContent(c);
                break;
            case 6 /* ParserState.ATTRKEY */:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrKey(c);
                break;
            case 8 /* ParserState.ATTRVALUE */:
                this.contextManager.addToPre(c);
                this.contextManager.addToAttrValue(c);
                break;
            default:
                break;
        }
    }
    parseChar(char) {
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
                }
                else if (char.match(/[0-9]/)) {
                    this.handleNumber(char);
                }
                else {
                    this.handleDefault(char);
                }
        }
    }
}
