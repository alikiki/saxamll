import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLEmitter, SaxaMLLParser, ParserState, XMLNodeDescription } from "../src";
import { getText } from '../src/utils';
import { XMLNode } from '../src/types';

describe('SaxaMLL - Events', () => {
    it('should emit an event when a tag is opened', () => {
        const emitter = new SaxaMLLEmitter();

        let response = "";
        emitter.addHandler('tagOpen', 'tweet', async (node: XMLNode) => {
            response = node.tag;
        })
        emitter.processEvent('tagOpen', 'tweet', {
            tag: "tweet",
            attributes: {},
            children: [],
            content: ""
        });

        expect(response).toBe("tweet");
    })
    it('should emit an event when a tag is closed', () => {
        const emitter = new SaxaMLLEmitter();

        let response = "";
        emitter.addHandler('tagClose', 'tweet', async (node: XMLNode) => {
            response = node.tag;
        })
        emitter.processEvent('tagClose', 'tweet', {
            tag: "tweet",
            attributes: {},
            children: [],
            content: ""
        });

        expect(response).toBe("tweet");
    })
    it('should do nothing after handler has been removed', () => {
        const emitter = new SaxaMLLEmitter();

        let response = "nothing";
        emitter.addHandler('tagClose', 'tweet', async (node: XMLNode) => {
            response = node.tag;
        })

        emitter.removeHandler('tagClose', 'tweet');
        emitter.processEvent('tagClose', 'tweet', {
            tag: "tweet",
            attributes: {},
            children: [],
            content: ""
        });

        expect(response).toBe("nothing");
    })
})
