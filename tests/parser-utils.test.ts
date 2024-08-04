import { describe, it, expect } from 'vitest';
import { getText, getRaw, SaxaMLLParser } from '../src';
import { XMLNode } from '../src/types';

describe('SaxaMLL - Utils', () => {
    it('gets text from a text node', () => {
        const ast = {
            tag: "text",
            attributes: {},
            children: [],
            content: "Hello",
            type: "text"
        } as XMLNode

        const text = getText(ast);
        expect(text).toEqual("Hello");
    })
    it('gets text from a single child XML AST', () => {
        const ast = {
            tag: "root",
            attributes: {},
            children: [
                {
                    tag: "tweet",
                    attributes: {},
                    children: [
                        {
                            tag: "text",
                            attributes: {},
                            children: [],
                            content: "Hello ",
                            type: "text"
                        },
                    ],
                    content: "",
                    type: "element"
                }
            ],
            type: "element"
        } as XMLNode

        const text = getText(ast);
        expect(text).toEqual("Hello ");
    })

    it('gets text from a nested XML AST', () => {
        const ast = {
            tag: "root",
            attributes: {},
            children: [
                {
                    tag: "tweet",
                    attributes: {},
                    children: [
                        {
                            tag: "text",
                            attributes: {},
                            children: [],
                            content: "Hello...",
                            type: "text"
                        },
                        {
                            tag: "question",
                            attributes: {},
                            children: [{
                                tag: "text",
                                attributes: {},
                                children: [],
                                content: "What is life?",
                                type: "text"
                            }],
                            content: "",
                            type: "element"
                        }
                    ],
                    content: "",
                    type: "element"
                }
            ],
            type: "element"
        } as XMLNode

        const text = getText(ast);
        expect(text).toEqual("Hello...What is life?");
    })

    it('should get raw XML', () => {
        const input = `<tweet>Hello</tweet>`;
        const parser = new SaxaMLLParser();

        parser.parse(input);

        const text = getRaw(parser.ast);
        expect(text).toEqual(input);
    })

    it('should get raw XML with attributes', () => {
        const input = `<tweet id="1">Hello</tweet>`;
        const parser = new SaxaMLLParser();

        parser.parse(input);

        const text = getRaw(parser.ast);
        expect(text).toEqual(input);
    })

    it('should get raw XML with nested elements', () => {
        const input = `<tweet id="1"><text>Hello</text></tweet>`;
        const parser = new SaxaMLLParser();

        parser.parse(input);

        const text = getRaw(parser.ast);
        expect(text).toEqual(input);
    })

    it('should get raw XML even on error, unclosed', () => {
        const input = `<tweet id="1"><text>Hello</tweet>`;
        const parser = new SaxaMLLParser();

        parser.parse(input);

        const text = getRaw(parser.ast);
        expect(text).toEqual(input);
    })

    it('should get raw XML even on error, unexpected', () => {
        const input = `<tweet<something> hello my na:""="me">Hello</tweet>`;
        const parser = new SaxaMLLParser();

        parser.parse(input);

        const text = getRaw(parser.ast);
        expect(text).toEqual(input);
    })

    it('should get raw XML even on error, bad close', () => {
        const input = `<tweet id="1">nothing else bro</text>`;
        const parser = new SaxaMLLParser();

        parser.parse(input);

        const text = getRaw(parser.ast);
        expect(text).toEqual
    })
})
