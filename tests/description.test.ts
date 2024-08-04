import { describe, it, expect } from 'vitest';
import { XMLNodeDescription } from "saxamll";

describe('SaxaMLL - XMLNodeDescription', () => {
    describe('Constructor and basic properties', () => {
        it('should create an instance with correct main prompt', () => {
            const desc = new XMLNodeDescription({
                tag: 'div',
                description: 'A division element',
            });
            expect(desc.mainPrompt).toBe('<div></div>: A division element\n');
        });

        it('should handle self-closing tags in main prompt', () => {
            const desc = new XMLNodeDescription({
                tag: 'img',
                description: 'An image element',
                selfClosing: true,
            });
            expect(desc.mainPrompt).toBe('<img/>: An image element (This is a self-closing tag)\n');
        });

        it('should initialize with empty attribute and example prompts', () => {
            const desc = new XMLNodeDescription({
                tag: 'p',
                description: 'A paragraph element',
            });
            expect(desc.attributePrompt).toBe('');
            expect(desc.examplePrompt).toBe('');
        });
    });

    describe('Attribute handling', () => {
        it('should generate attribute prompt when attributes are provided', () => {
            const desc = new XMLNodeDescription({
                tag: 'a',
                description: 'An anchor element',
                attributes: { href: 'Link destination', target: 'Link target' },
            });
            expect(desc.attributePrompt).toContain('Attributes:');
            expect(desc.attributePrompt).toContain('href: Link destination');
            expect(desc.attributePrompt).toContain('target: Link target');
        });

        it('should update attribute prompt when setAttributes is called', () => {
            const desc = new XMLNodeDescription({ tag: 'input', description: 'An input element' });
            desc.setAttributes({ type: 'text', name: 'username' });
            expect(desc.attributePrompt).toContain('type: text');
            expect(desc.attributePrompt).toContain('name: username');
        });
    });

    describe('Example handling', () => {
        it('should generate example prompt when examples are set', () => {
            const desc = new XMLNodeDescription({ tag: 'ul', description: 'An unordered list' });
            desc.setExamples([
                { input: '<ul><li>Item 1</li></ul>', output: 'List with one item' },
            ]);
            expect(desc.examplePrompt).toContain('Examples:');
            expect(desc.examplePrompt).toContain('Input: "<ul><li>Item 1</li></ul>"');
            expect(desc.examplePrompt).toContain('Output: "List with one item"');
        });

        it('should handle multiple examples', () => {
            const desc = new XMLNodeDescription({ tag: 'ol', description: 'An ordered list' });
            desc.setExamples([
                { input: '<ol><li>First</li></ol>', output: 'Ordered list with one item' },
                { input: '<ol><li>First</li><li>Second</li></ol>', output: 'Ordered list with two items' },
            ]);
            const exampleLines = desc.examplePrompt.split('\n');
            expect(exampleLines.filter(line => line.includes('Input:')).length).toBe(2);
            expect(exampleLines.filter(line => line.includes('Output:')).length).toBe(2);
        });
    });

    describe('Combined prompt', () => {
        it('should combine all prompts correctly', () => {
            const desc = new XMLNodeDescription({
                tag: 'input',
                description: 'An input element',
                attributes: { type: 'text' },
            });
            desc.setExamples([{ input: '<input type="text"/>', output: 'Text input field' }]);

            const combinedPrompt = desc.prompt;
            expect(combinedPrompt).toContain('<input></input>: An input element');
            expect(combinedPrompt).toContain('Attributes:');
            expect(combinedPrompt).toContain('type: text');
            expect(combinedPrompt).toContain('Examples:');
            expect(combinedPrompt).toContain('Input: "<input type="text"/>"');
            expect(combinedPrompt).toContain('Output: "Text input field"');
        });
    });

    describe('Prompt overloading', () => {
        it('should overload the main prompt', () => {
            const desc = new XMLNodeDescription({ tag: 'span', description: 'An inline element' });
            const customPrompt = 'Custom main prompt for span element\n';
            desc.overloadMainPrompt(customPrompt);
            expect(desc.mainPrompt).toBe(customPrompt);
            expect(desc.prompt).toContain(customPrompt);
        });

        it('should overload example prompt formatting', () => {
            const desc = new XMLNodeDescription({ tag: 'h1', description: 'A top-level heading' });
            desc.setExamples([{ input: '<h1>Title</h1>', output: 'Rendered heading' }]);
            desc.overloadExamplePrompt((example) => `Custom: ${example.input} -> ${example.output}\n`);
            expect(desc.examplePrompt).toContain('Custom: <h1>Title</h1> -> Rendered heading');
            expect(desc.prompt).toContain('Custom: <h1>Title</h1> -> Rendered heading');
        });

        it('should overload attribute prompt formatting', () => {
            const desc = new XMLNodeDescription({
                tag: 'img',
                description: 'An image element',
                attributes: { src: 'Image source', alt: 'Alternative text' },
            });
            desc.overloadAttributePrompt((key, value) => `${key.toUpperCase()}: ${value}\n`);
            expect(desc.attributePrompt).toContain('SRC: Image source');
            expect(desc.attributePrompt).toContain('ALT: Alternative text');
            expect(desc.prompt).toContain('SRC: Image source');
        });
    });
});