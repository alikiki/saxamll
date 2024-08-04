import { XMLNodeDescriptionExample } from "../types/index";
export default class XMLNodeDescription {
    private _tag;
    private _description;
    private _attributes;
    private _mainPrompt;
    private _attributePrompt;
    private _examplePrompt;
    private _examples;
    private _selfClosing;
    private _customExamplePromptCallback;
    private _customAttributePromptCallback;
    constructor(desc: {
        tag: string;
        description: string;
        selfClosing?: boolean;
        attributes?: Record<string, string>;
    });
    private generateMainPrompt;
    get tag(): string;
    get prompt(): string;
    get mainPrompt(): string;
    get attributePrompt(): string;
    get examplePrompt(): string;
    setExamples(examples: XMLNodeDescriptionExample[]): void;
    setAttributes(attributes: Record<string, string>): void;
    private generateExamplePrompt;
    private generateAttributePrompt;
    overloadMainPrompt(prompt: string): void;
    overloadExamplePrompt(callback: ((example: XMLNodeDescriptionExample) => string) | null): void;
    overloadAttributePrompt(callback: ((key: string, value: string) => string) | null): void;
}
//# sourceMappingURL=index.d.ts.map