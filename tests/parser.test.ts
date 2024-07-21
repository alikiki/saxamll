import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLEmitter, SaxaMLLParser, ParserState, SaxaMLLGenerator } from "../src";
import { getText } from '../src/utils';

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
})

describe('SaxaMLL - Events', () => {
    beforeEach(() => {
        const emitter = new SaxaMLLEmitter();
    })

    it('should emit an event when a tag is opened', () => { })
})

describe('SaxaMLL - Prompt generator', () => {
    beforeEach(() => {
        const generator = new SaxaMLLGenerator();
    })

    it('should generate a prompt from an XML description', () => { });
})