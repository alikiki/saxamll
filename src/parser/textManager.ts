import SaxaMLLEmitter from "./emitter";

interface Scope {
    scope: string;
    content: string;
    rawContent: string;
    children: Scope[];
}

/**
 * 1. Always add to rawContent, and increment the rawContentPointer. 
 * - For each tag in the stack, increment the end pointer of the rawContent.
 * 
 * 2. Add to content if the parser state is TEXT.
 * - For each tag in the stack, increment the end pointer of the content.
 * 
 * 3. When the scope changes, mark 
 */

export default class SaxaMLLTextManager {
    private _stack: string[] = ["root"];

    private _contentPointer: number = 0;
    private _rawContentPointer: number = 0;

    private content: string = "";
    private rawContent: string = "";

    // [start, end]
    private scopedContent: Record<string, number[]> = { "root": [-1, -1] };
    private scopedRawContent: Record<string, number[]> = { "root": [-1, -1] };

    public emitter: SaxaMLLEmitter;

    constructor(emitter: SaxaMLLEmitter) {
        this.emitter = emitter;
    }

    public get stack() {
        return this._stack;
    }

    public get contentPointer() {
        return this._contentPointer;
    }

    public get rawContentPointer() {
        return this._rawContentPointer;
    }

    public enterScope(scope: string) {
        this._push(scope);
    }

    private markStart() {
        const currentTopOfStack = this._peek();

        this.scopedContent[currentTopOfStack] = [this.contentPointer, this.contentPointer];
        this.scopedRawContent[currentTopOfStack] = [this.rawContentPointer, this.rawContentPointer];
    }

    private advanceEnd() {
        const currentTopOfStack = this._peek();

        this.scopedContent[currentTopOfStack][1] = this.contentPointer;
        this.scopedRawContent[currentTopOfStack][1] = this.rawContentPointer;
    }

    public updateContent(s: string) {
        this.content += s;
        this._contentPointer += s.length;
    }

    public updateRawContent(s: string) {
        this.rawContent += s;
        this._rawContentPointer += s.length;
    }

    private _peek() {
        return this._stack[this._stack.length - 1];
    }

    private _push(scope: string) {
        this._stack.push(scope);

        this.scopedContent[scope] = [];
        this.scopedRawContent[scope] = [];
    }

    private _pop() {
        return this._stack.pop();
    }

    private _popAndPeek() {
        this._pop();
        return this._peek();
    }
}