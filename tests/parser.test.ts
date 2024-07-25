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
        expect(prompt).toEqual('<classification></classification>: classification of the text inside the <sentence> tag as `positive` or `negative`.\n<example><input>"<sentence>It was a good day.</sentence>"</input><output>"positive"</output></example><example><input>"<sentence>It was a bad day.</sentence>"</input><output>"negative"</output></example>');
    })
})

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

/**
 * Example syntax for XML DSL:
 * <tweet>
 *  <historicalFigure query="charlie parker portrait" success="Charlie Parker" failure="Charlie Parker"></historicalFigure> was a saxophonist.
 *  <replaceWithVideo query="charlie parker confirmation" success="Here is a video." failure=""></replaceWithVideo>
 * </tweet>
 * 
 * <tweet>
 * <question>When was Charlie Parker born?</question>
 * <answer>Charlie Parker was born in xxxx.</answer>
 * </tweet>
 * 
 * <tweet>
 * <question>What is Charlie Parker's most famous song?</question>
 * <answer>Charlie Parker's most famous song is xxxx.</answer>
 * </tweet>
 */

describe('SaxaMLL - Core', () => {
    let parser: SaxaMLLParser;
    beforeEach(() => {
        parser = new SaxaMLLParser();
    })

    it('should be in an OPENTAG state when a new tag is opened but not yet closed', () => {
        parser.parse("<");
        expect(parser.state).toEqual(ParserState.OPENTAG);
    });
    it('should be in a TAG state when the new tag name is being parsed', () => {
        parser.parse("<tweet");
        expect(parser.state).toEqual(ParserState.TAGNAME);
    })
    it('should be in an OPEN state when a new tag name is parsed', () => {
        parser.parse("<tweet>");
        expect(parser.state).toEqual(ParserState.OPEN);
    })
    it('should be able to parse the tag name when the tag is closed', () => {
        parser.parse("<tweet>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [],
                content: ""
            }]
        })
    })
    it('should be in a CLOSETAG state when tag is half-closed', () => {
        parser.parse("<tweet></twe");
        expect(parser.state).toEqual(ParserState.CLOSETAG);
    });
    it('should be in an IDLE state when tag is fully closed', () => {
        parser.parse("<tweet></tweet>");
        expect(parser.state).toEqual(ParserState.IDLE);
    });
    it('should be in an OPEN state when not all tags are closed', () => {
        parser.parse("<tweet><question></question>");
        expect(parser.state).toEqual(ParserState.OPEN);
    })
    it('should be able to parse nested tags', () => {
        parser.parse("<tweet><question>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [{
                    tag: "question",
                    attributes: {},
                    children: [],
                    content: ""
                }],
                content: ""
            }]
        })
    });
    it('should be in TEXT state when text content is being parsed', () => {
        parser.parse("<tweet>Hel");
        expect(parser.state).toEqual(ParserState.TEXT);
    })
    it('should be able to parse text content within a tag', () => {
        parser.parse("<tweet>Hello</tweet>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [{
                    tag: "text",
                    attributes: {},
                    children: [],
                    content: "Hello"
                }],
                content: ""
            }]
        })
    })
    it('should be in OPENTAG state when a new tag is open after text content', () => {
        parser.parse("<tweet>Hello<");
        expect(parser.state).toEqual(ParserState.OPENTAG);
    })
    it('should be in TAGNAME state when a new tag is opened after text content', () => {
        parser.parse("<tweet>Hello<question");
        expect(parser.state).toEqual(ParserState.TAGNAME);
    })
    it('should be in OPEN state when a new tag is closed after text content', () => {
        parser.parse("<tweet>Hello<question>");
        expect(parser.state).toEqual(ParserState.OPEN);
    })
    it('should be in an OPEN state if all the tags have not been closed', () => {
        parser.parse('<tweet>Hello <question></question>');
        expect(parser.state).toEqual(ParserState.OPEN);
    })
    it('should be able to parse mixed content within a tag', () => {
        parser.parse("<tweet>Hello <question></question></tweet>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [{
                    tag: "text",
                    attributes: {},
                    children: [],
                    content: "Hello "
                }, {
                    tag: "question",
                    attributes: {},
                    children: [],
                    content: ""
                }],
                content: ""
            }]
        })
    })
    it('should be able parse incomplete XML tags', () => {
        parser.parse("<twe");
        parser.parse("et>");

        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [],
                content: ""
            }]
        })
    })
    it('should be in ATTRKEY state when an attribute key is being parsed', () => {
        parser.parse("<tweet i");
        expect(parser.state).toEqual(ParserState.ATTRKEY);

        parser.parse("d");
        expect(parser.state).toEqual(ParserState.ATTRKEY);
    })
    it('should be in ATTRVALUE state when an attribute value is being parsed', () => {
        parser.parse("<tweet id=");
        expect(parser.state).toEqual(ParserState.ATTRVALUEREADY);

        parser.parse('"');
        expect(parser.state).toEqual(ParserState.ATTRVALUE);

        parser.parse('1');
        expect(parser.state).toEqual(ParserState.ATTRVALUE);
    })
    it('should be in ATTRKEY state when a space occurs after the tagname', () => {
        parser.parse("<tweet ");
        expect(parser.state).toEqual(ParserState.ATTRKEY);
    })
    it('should be in ATTRKEY state after an attribute value is closed', () => {
        parser.parse("<tweet id=\"1\"");
        expect(parser.state).toEqual(ParserState.ATTRKEY);
    })
    it('should be in OPEN state after an attribute key-value pair is closed', () => {
        parser.parse("<tweet id=\"1\">");
        expect(parser.state).toEqual(ParserState.OPEN);
    })
    it('should parse an attribute key-value pair', () => {
        parser.parse("<tweet id=\"1\">");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {
                    id: "1"
                },
                children: [],
                content: ""
            }]
        })
    });
    it('should parse multiple attribute key-value pairs', () => {
        parser.parse("<tweet id=\"1\" name=\"tweet\">");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {
                    id: "1",
                    name: "tweet"
                },
                children: [],
                content: ""
            }]
        })
    })
    it('should parse nested tags with multiple attributes', () => {
        parser.parse("<tweet id=\"1\" name=\"tweet\"><question q=\"what is life?\"></question></tweet>");

        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {
                    id: "1",
                    name: "tweet"
                },
                children: [{
                    tag: "question",
                    attributes: {
                        q: "what is life?"
                    },
                    children: [],
                    content: ""
                }],
                content: ""
            }]
        })
    })

    it('should be able to parse multiple times', () => {
        parser.parse("<tweet id=\"1\" name=\"tweet\">");
        parser.parse("<question q=\"what is life?\"></question>");
        parser.parse("</tweet>");

        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {
                    id: "1",
                    name: "tweet"
                },
                children: [{
                    tag: "question",
                    attributes: {
                        q: "what is life?"
                    },
                    children: [],
                    content: ""
                }],
                content: ""
            }]
        })
    })
})

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
})