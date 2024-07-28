import { describe, it, expect } from 'vitest';
import { getText } from '../src';

describe('SaxaMLL - Utils', () => {
    it('gets text from a text node', () => {
        const ast = {
            tag: "text",
            attributes: {},
            children: [],
            content: "Hello"
        }

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
                            content: "Hello "
                        },
                    ],
                    content: ""
                }
            ]
        }

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
                            content: "Hello..."
                        },
                        {
                            tag: "question",
                            attributes: {},
                            children: [{
                                tag: "text",
                                attributes: {},
                                children: [],
                                content: "What is life?"
                            }],
                            content: ""
                        }
                    ],
                    content: ""
                }
            ]
        }

        const text = getText(ast);
        expect(text).toEqual("Hello...What is life?");
    })
})
