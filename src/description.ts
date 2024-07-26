import { XMLNodeDescriptionExample } from "./types/index";


class XMLNodeDescription {
    tag: string;
    description: string;
    attributes: Record<string, string> = {};
    prompt: string | null = null;
    examples: XMLNodeDescriptionExample[] = [];

    constructor(desc) {
        this.tag = desc.tag;
        this.description = desc.description;
    }

    getPrompt() {
        if (this.prompt) return this.prompt;

        const wrappedTag = `<${this.tag}>`;
        const wrappedTagWithSlash = `</${this.tag}>`;

        const mainPrompt = `${wrappedTag}${wrappedTagWithSlash}: ${this.description}\n` + this.getExamplePrompt();

        return mainPrompt;
    }

    overloadPrompt(prompt: string | null) {
        this.prompt = prompt;
    }

    setExamples(examples: XMLNodeDescriptionExample[]) {
        this.examples = examples;
    }

    getExamplePrompt(): string {
        if (this.examples.length === 0) return "";

        let examplePrompt = "";
        for (let example of this.examples) {
            examplePrompt += `Example:\n\tInput: \"${example.input}\"\n\tOutput: \"${example.output}\"\n`;
        }

        return examplePrompt
    }
}

export { XMLNodeDescription };