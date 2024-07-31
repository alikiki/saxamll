import { ParserState } from "./state";
import { XMLNode } from "../types/index";
import SaxaMLLExecutor from "./executor";
import SaxaMLLParserContextManager from "./contextManager";

export default class SaxaMLLParserStateManager {
    private _state: ParserState = ParserState.IDLE;
    private _ast: XMLNode = { tag: "root", attributes: {}, children: [] };
    private _stack: { node: XMLNode; state: ParserState }[] = [{ node: this._ast, state: ParserState.IDLE }];

    public executor: SaxaMLLExecutor;
    contextManager: SaxaMLLParserContextManager;

    constructor(contextManager: SaxaMLLParserContextManager, executor: SaxaMLLExecutor) {
        this.executor = executor;
        this.contextManager = contextManager;
    }

    public get ast() {
        return this._ast;
    }

    public get stack() {
        return this._stack;
    }

    public get state() {
        return this._state;
    }

    public transition(state: ParserState) {
        this._state = state;
    }

    public enterScope() {
        if (this.contextManager.isCurrChildEmpty()) return;

        const node = this.contextManager.currChildNode;

        this._addChild(node);
        this._push(node);

        // Emit an event that a opening tag has been parsed
        const modifiedTagName = `tagOpen:${node.tag}`;
        this.executor.emit(modifiedTagName, node);

        // Empty out the collector
        this.contextManager.clearChildNode();
    }

    public exitScope() {
        const currentTopOfStack = this._peek();
        const currentChildNode = this.contextManager.currChildNode;

        if (currentTopOfStack.node.tag !== currentChildNode.tag) {
            // Construct an error node
            if (currentTopOfStack.node.tag !== "root") {
                this.contextManager.setContent(`Expected closing tag for "${currentTopOfStack.node.tag}" but found "${currentChildNode.tag}"`);
            } else {
                this.contextManager.setContent(`Unexpected closing tag "${currentChildNode.tag}"`);
            }

            this.contextManager.setTagName("error");

            // Commit the error node
            this.commitChild();

            // Transition to error state
            this.transition(ParserState.ERROR);

            // TODO: emit an error message
            return;
        }

        // Add the post content to the current top of stack
        currentTopOfStack.node.post = currentChildNode.post;

        const topOfStack = this._popAndPeek();
        const modifiedTagName = `tagClose:${topOfStack.node.tag}`;
        this.executor.emit(modifiedTagName, topOfStack.node);

        this.contextManager.clearChildNode();
        this.transition(topOfStack.state);
    }

    public tagClosed() {
        const currentTopOfStack = this._peek();
        const currentChildNode = this.contextManager.currChildNode;

        if (currentTopOfStack.node.tag !== currentChildNode.tag) {
            this.commitChild();
            this.transition(currentTopOfStack.state);
            return;
        }

        const topOfStack = this._popAndPeek();
        const modifiedTagName = `tagClose:${topOfStack.node.tag}`;
        this.executor.emit(modifiedTagName, topOfStack.node);

        this.contextManager.clearChildNode();
        this.transition(topOfStack.state);
    }

    public commitChild() {
        if (this.contextManager.isCurrChildEmpty()) return;

        const node = this.contextManager.currChildNode;

        // Add and clear
        this._addChild(node);
        this.contextManager.clearChildNode();
    }

    public flush() {
        // Push the last child node
        this.commitChild();

        console.log(this.ast);

        // Pop until the stack is empty
        while (this._stack.length > 1) {
            this.exitScope();
        }
    }

    private _addChild(child: XMLNode) {
        this._stack[this._stack.length - 1].node.children.push(child);
    }
    private _push(node: XMLNode) {
        this._stack.push({ node, state: this._state });
    }
    private _pop() {
        return this._stack.pop();
    }

    private _peek() {
        return this._stack[this._stack.length - 1];
    }

    private _popAndPeek() {
        this._pop();
        return this._peek();
    }
}