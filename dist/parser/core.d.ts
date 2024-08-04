import { ParserState } from "./state";
import SaxaMLLExecutor from "./executor";
export default class SaxaMLLParser {
    private buffer;
    private currIdx;
    executor: SaxaMLLExecutor;
    private contextManager;
    private stateManager;
    get ast(): import("../types/index").XMLNode;
    get state(): ParserState;
    get stack(): {
        node: import("../types/index").XMLNode;
        state: ParserState;
    }[];
    parse(input: string): void;
    update(): void;
    end(): void;
    setExecutor(executor: SaxaMLLExecutor): void;
    private handleLessThan;
    private handleGreaterThan;
    private handleForwardSlash;
    private handleDoubleQuotation;
    private handleSingleQuotation;
    private handleQuotation;
    private handleEqualSign;
    private handleSpace;
    private handleAlphabet;
    private handleNumber;
    private handleDefault;
    private parseChar;
}
//# sourceMappingURL=core.d.ts.map