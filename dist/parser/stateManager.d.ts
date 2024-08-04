import { ParserState } from "./state";
import { XMLNode } from "../types/index";
import SaxaMLLExecutor from "./executor";
import SaxaMLLParserContextManager from "./contextManager";
import { ParserError } from "./error";
export default class SaxaMLLParserStateManager {
    private _state;
    private _ast;
    private _stack;
    executor: SaxaMLLExecutor;
    contextManager: SaxaMLLParserContextManager;
    _error: ParserError | null;
    constructor(contextManager: SaxaMLLParserContextManager, executor: SaxaMLLExecutor);
    get ast(): XMLNode;
    get stack(): {
        node: XMLNode;
        state: ParserState;
    }[];
    get state(): ParserState;
    get error(): ParserError | null;
    setError(error: ParserError): void;
    transition(state: ParserState): void;
    enterScope(): void;
    exitScope(): void;
    tagClosed(): void;
    commitChild(): void;
    flushAll(): void;
    flush(): void;
    private _addChild;
    private _push;
    private _pop;
    private _peek;
}
//# sourceMappingURL=stateManager.d.ts.map