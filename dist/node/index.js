export default class XMLNodeDescription {
    constructor(desc) {
        this._attributes = {};
        this._mainPrompt = "";
        this._attributePrompt = "";
        this._examplePrompt = "";
        this._examples = [];
        this._customExamplePromptCallback = null;
        this._customAttributePromptCallback = null;
        this._tag = desc.tag;
        this._description = desc.description;
        this._selfClosing = desc.selfClosing || false;
        this._attributes = desc.attributes || {};
        this._mainPrompt = this.generateMainPrompt();
        this._attributePrompt = this.generateAttributePrompt();
    }
    generateMainPrompt() {
        if (this._selfClosing) {
            return `<${this._tag}/>: ${this._description} (This is a self-closing tag)\n`;
        }
        else {
            return `<${this._tag}></${this._tag}>: ${this._description}\n`;
        }
    }
    get tag() {
        return this._tag;
    }
    get prompt() {
        return this._mainPrompt + this._attributePrompt + this._examplePrompt;
    }
    get mainPrompt() {
        return this._mainPrompt;
    }
    get attributePrompt() {
        return this._attributePrompt;
    }
    get examplePrompt() {
        return this._examplePrompt;
    }
    setExamples(examples) {
        this._examples = examples;
        this._examplePrompt = this.generateExamplePrompt();
    }
    setAttributes(attributes) {
        this._attributes = attributes;
        this._attributePrompt = this.generateAttributePrompt();
    }
    generateExamplePrompt() {
        if (this._examples.length === 0)
            return "";
        let examplePrompt = "Examples:\n";
        for (let example of this._examples) {
            if (this._customExamplePromptCallback) {
                examplePrompt += this._customExamplePromptCallback(example);
            }
            else {
                examplePrompt += `\tInput: "${example.input}"\n\tOutput: "${example.output}"\n`;
            }
        }
        return examplePrompt;
    }
    generateAttributePrompt() {
        if (Object.keys(this._attributes).length === 0)
            return "";
        let attributePrompt = "Attributes:\n";
        for (let [key, value] of Object.entries(this._attributes)) {
            if (this._customAttributePromptCallback) {
                attributePrompt += this._customAttributePromptCallback(key, value);
            }
            else {
                attributePrompt += `\t${key}: ${value}\n`;
            }
        }
        return attributePrompt;
    }
    overloadMainPrompt(prompt) {
        this._mainPrompt = prompt;
    }
    overloadExamplePrompt(callback) {
        this._customExamplePromptCallback = callback;
        this._examplePrompt = this.generateExamplePrompt();
    }
    overloadAttributePrompt(callback) {
        this._customAttributePromptCallback = callback;
        this._attributePrompt = this.generateAttributePrompt();
    }
}
