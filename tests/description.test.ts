import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLEmitter, SaxaMLLParser, ParserState, XMLNodeDescription } from "../src";
import { getText } from '../src/utils';
import { XMLNode } from '../src/types';

describe('SaxaMLL - XMLNodeDescription', () => {
    it('generates a prompt from an XML AST with no attributes', () => {
        const classification = new XMLNodeDescription({
            tag: 'classification',
            description: 'classification of the text inside the <sentence> tag as `positive` or `negative`.',
            attributes: {}
        });

        const prompt = classification.getPrompt();
        expect(prompt).toEqual('<classification></classification>: classification of the text inside the <sentence> tag as `positive` or `negative`.\n');
    })

    it('generates a prompt from an XML AST with attributes', () => { })
    it('generates a prompt from an XML AST with examples', () => {
        const classification = new XMLNodeDescription({
            tag: 'classification',
            description: 'classification of the text inside the <sentence> tag as `positive` or `negative`.',
            attributes: {}
        });

        classification.setExamples([
            {
                input: "<sentence>It was a good day.</sentence>",
                output: "positive"
            },
            {
                input: "<sentence>It was a bad day.</sentence>",
                output: "negative"
            }
        ]);

        const prompt = classification.getPrompt();
        expect(prompt).toEqual('<classification></classification>: classification of the text inside the <sentence> tag as `positive` or `negative`.\nExample:\n\tInput: "<sentence>It was a good day.</sentence>"\n\tOutput: "positive"\nExample:\n\tInput: "<sentence>It was a bad day.</sentence>"\n\tOutput: "negative"\n');
    })
})
