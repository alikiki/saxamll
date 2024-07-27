import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLEmitter, SaxaMLLParser, ParserState, XMLNodeDescription } from "../src";
import { getText } from '../src/utils';
import { XMLNode } from '../src/types';

describe('SaxaMLL - Integration', () => {
    it('should be read the contents of a single xml tag', () => {
        const parser = new SaxaMLLParser();
        let results = "";
        parser.emitter.addHandler('tagClose', 'tweet', (node: XMLNode) => {
            results = getText(node);
        })

        parser.parse("<tweet>Hello</tweet>");
        expect(results).toBe("Hello");
    })
    it('should be able to interpret attributes on tagOpen', () => {
        const parser = new SaxaMLLParser();
        let results = "";
        parser.emitter.addHandler('tagOpen', 'tweet', (node: XMLNode) => {
            results = node.attributes.id;
        })

        parser.parse("<tweet id=\"1\">");
        expect(results).toBe("1");
    })
    it.skip('', () => {
        const parser = new SaxaMLLParser();
        let results = "";

        parser.emitter.addHandler('tagOpen', 'response', (node: XMLNode) => {
            results += getTextDelta(node);
        })
        parser.emitter.addHandler('tagClose', 'toReplaceWithImage', async (node: XMLNode) => {
            const query = node.attributes.query;
            const success = node.attributes.onSuccess;
            const failure = node.attributes.onFailure;

            const response = await fetch();
            const data = await response.json();

            if (data.results.length > 0) {
                results += success;
            } else {
                results += failure;
            }
        })

        parser.parse("<response>Barack Obama is the 44th US president.<toReplaceWithImage onSuccess='Here is a photo of Obama:', onFailure='' query='portrait of obama'><toReplaceWithImage></response>");

        // assuming that the API call is successful
        expect(results).toBe("Barack Obama is the 44th US president. Here is a photo of Obama:");
    })
})
