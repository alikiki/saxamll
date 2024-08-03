import { XMLNodeDescriptionExample } from "../types/index";

export default class XMLNodeDescription {
    private _tag: string;
    private _description: string;
    private _attributes: Record<string, string> = {};
    private _mainPrompt: string = "";
    private _attributePrompt: string = "";
    private _examplePrompt: string = "";
    private _examples: XMLNodeDescriptionExample[] = [];
    private _selfClosing: boolean;
    private _customExamplePromptCallback: ((example: XMLNodeDescriptionExample) => string) | null = null;
    private _customAttributePromptCallback: ((key: string, value: string) => string) | null = null;

    constructor(desc: { tag: string; description: string; selfClosing?: boolean; attributes?: Record<string, string> }) {
        this._tag = desc.tag;
        this._description = desc.description;
        this._selfClosing = desc.selfClosing || false;
        this._attributes = desc.attributes || {};

        this._mainPrompt = this.generateMainPrompt();
        this._attributePrompt = this.generateAttributePrompt();
    }

    private generateMainPrompt(): string {
        if (this._selfClosing) {
            return `<${this._tag}/>: ${this._description} (This is a self-closing tag)\n`;
        } else {
            return `<${this._tag}></${this._tag}>: ${this._description}\n`;
        }
    }

    get tag(): string {
        return this._tag;
    }

    get prompt(): string {
        return this._mainPrompt + this._attributePrompt + this._examplePrompt;
    }

    get mainPrompt(): string {
        return this._mainPrompt;
    }

    get attributePrompt(): string {
        return this._attributePrompt;
    }

    get examplePrompt(): string {
        return this._examplePrompt;
    }

    public setExamples(examples: XMLNodeDescriptionExample[]): void {
        this._examples = examples;
        this._examplePrompt = this.generateExamplePrompt();
    }

    public setAttributes(attributes: Record<string, string>): void {
        this._attributes = attributes;
        this._attributePrompt = this.generateAttributePrompt();
    }

    private generateExamplePrompt(): string {
        if (this._examples.length === 0) return "";

        let examplePrompt = "Examples:\n";
        for (let example of this._examples) {
            if (this._customExamplePromptCallback) {
                examplePrompt += this._customExamplePromptCallback(example);
            } else {
                examplePrompt += `\tInput: "${example.input}"\n\tOutput: "${example.output}"\n`;
            }
        }

        return examplePrompt;
    }

    private generateAttributePrompt(): string {
        if (Object.keys(this._attributes).length === 0) return "";

        let attributePrompt = "Attributes:\n";
        for (let [key, value] of Object.entries(this._attributes)) {
            if (this._customAttributePromptCallback) {
                attributePrompt += this._customAttributePromptCallback(key, value);
            } else {
                attributePrompt += `\t${key}: ${value}\n`;
            }
        }

        return attributePrompt;
    }

    public overloadMainPrompt(prompt: string): void {
        this._mainPrompt = prompt;
    }

    public overloadExamplePrompt(callback: ((example: XMLNodeDescriptionExample) => string) | null): void {
        this._customExamplePromptCallback = callback;
        this._examplePrompt = this.generateExamplePrompt();
    }

    public overloadAttributePrompt(callback: ((key: string, value: string) => string) | null): void {
        this._customAttributePromptCallback = callback;
        this._attributePrompt = this.generateAttributePrompt();
    }
}