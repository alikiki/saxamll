import { ParserState } from "./state";
import { XMLNode } from "../types/index";
import SaxaMLLExecutor from "./executor";
import SaxaMLLParserContextManager from "./contextManager";
import { ParserError } from "./error";

export default class SaxaMLLParserStateManager {
    private _state: ParserState = ParserState.IDLE;
    private _ast: XMLNode = { tag: "root", attributes: {}, children: [], type: "element" };
    private _stack: { node: XMLNode; state: ParserState }[] = [{ node: this._ast, state: ParserState.IDLE }];

    public executor: SaxaMLLExecutor;
    contextManager: SaxaMLLParserContextManager;

    public _error: ParserError | null = null;

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

    public get error() {
        return this._error;
    }

    public setError(error: ParserError) {
        this.executor.emit("error", error);
        this._error = error;
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
            this.contextManager.setNodeType("error");

            // Commit the error node
            this.commitChild();

            // Transition to error state
            this.transition(ParserState.ERROR);
            this.setError(ParserError.BAD_CLOSE_TAG);

            // TODO: emit an error message
            return;
        }

        // Add the post content to the current top of stack
        currentTopOfStack.node.post = currentChildNode.post;

        const popped = this._pop();
        const topOfStack = this._peek();
        const modifiedTagName = `tagClose:${popped.node.tag}`;
        this.executor.emit(modifiedTagName, popped.node);

        this.contextManager.clearChildNode();
        this.transition(topOfStack.state);
    }

    public tagClosed() {
        const currentTopOfStack = this._peek();
        const currentChildNode = this.contextManager.currChildNode;

        // for self closing tags
        if (currentTopOfStack.node.tag !== currentChildNode.tag) {
            this.commitChild();
            this.transition(currentTopOfStack.state);
        }
    }

    public commitChild() {
        if (this.contextManager.isCurrChildEmpty()) return;

        const node = this.contextManager.currChildNode;

        // Add and clear
        this._addChild(node);

        // Emit event
        const top = this._peek().node;
        this.executor.emit("update", [top, node, true]);
        this.executor.emit(`update:${top.tag}`, [top, node, true]);

        this.contextManager.clearChildNode();
    }

    public flushAll() {
        // Push the last child node
        this.commitChild();

        // Pop until the stack is empty
        while (this._stack.length > 1) {
            this.exitScope();
        }
    }

    public flush() {
        // FIX:
        // I only really want to flush if it's a text node
        // main reason being that if it's in the middle of parsing an element node,
        // then the tree representation gets fucked up
        // I could implement diffs, but it's annoying... but I probably should.
        const node = this.contextManager.currChildNode;

        if (node.type === "text") {
            // commit the current child
            this.commitChild();
            return;
        }

        const top = this._peek().node;
        this.executor.emit("update", [top, node, false]);
        this.executor.emit(`update:${top.tag}`, [top, node, false]);
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
}