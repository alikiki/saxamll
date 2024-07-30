import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLExecutor, SaxaMLLParser, ParserState, XMLNodeDescription } from "../src";
import { getText } from '../src/utils';
import { XMLNode } from '../src/types';

describe('SaxaMLL - Examples', () => {
    it('should be able to parse the example from simple_classification.ts', () => {
        const parser = new SaxaMLLParser();
        const classification = new XMLNodeDescription({
            tag: "classification",
            description: "Put 'positive' if the text inside '<sentence></sentence> tags is positive. Put 'negative' if the text is negative"
        })

        classification.setExamples([
            {
                input: "<sentence>I'm eating lobsters and I'm so happy.</sentence>",
                output: "<classification>positive</classification>"
            }
        ])

        console.log(classification.getPrompt());

        let response = "";
        parser.emitter.addHandler('tagClose', classification, (node: XMLNode) => {
            response = getText(node);
        })

        parser.parse("<classification>positive</classification>");
        expect(response).toBe("positive");
    })
    it("", () => {
        const videoSearchTag = new XMLNodeDescription({
            tag: "videoSearch",
            selfClosing: true,
            description: "Search for a video given a keyword. The `query` attribute should contain the keyword"
        })

        videoSearchTag.setExamples([
            {
                input: "Tell me more about lobsters.",
                output: "<videoSearch query='lobster' />"
            },
            {
                input: "Who was muhammad ali?",
                output: "<videoSearch query='muhammad ali'/>"
            },
        ])

        console.log(videoSearchTag.getPrompt());
    })
})