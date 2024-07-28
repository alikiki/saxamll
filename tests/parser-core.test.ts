import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLEmitter, SaxaMLLParser, ParserState, XMLNodeDescription } from "../src";


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

    it('should be in a TEXT state if there is a space after `<', () => {
        parser.parse("< tweet");
        expect(parser.state).toEqual(ParserState.TEXT);
    })

    it('should recognize `<` immediately NOT followed by an alphabet as text', () => {
        parser.parse("< 10");
        parser.end();
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "text",
                attributes: {},
                children: [],
                content: "< 10"
            }]
        })
    })

    it('should recognize `>` with spaces around it as text', () => {
        parser.parse("tweet >");
        parser.end();
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "text",
                attributes: {},
                children: [],
                content: "tweet >"
            }]
        })

        // Clearing out the parser
        parser = new SaxaMLLParser();

        parser.parse("10 < 20, but 20 > 5");
        parser.end();
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "text",
                attributes: {},
                children: [],
                content: "10 < 20, but 20 > 5"
            }]
        })
    })
    it('should be fine with spaces around the `=` sign in attribute key-value pairs', () => {
        parser.parse("<tweet id = \"1\">");
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
    })

    it('should recogize when a new tag is being opened', () => {
        parser.parse("<tweet><question>");
        expect(parser.stack).toEqual([
            {
                node: {
                    tag: "root",
                    attributes: {},
                    children: [
                        {
                            tag: "tweet",
                            attributes: {},
                            children: [{
                                tag: "question",
                                attributes: {},
                                children: [],
                                content: ""
                            }],
                            content: ""
                        }
                    ],
                },
                state: ParserState.IDLE
            },
            {
                node: {
                    tag: "tweet",
                    attributes: {},
                    children: [{
                        tag: "question",
                        attributes: {},
                        children: [],
                        content: ""
                    }],
                    content: ""
                },
                state: ParserState.OPEN
            },
            {
                node: {
                    tag: "question",
                    attributes: {},
                    children: [],
                    content: ""
                },
                state: ParserState.OPEN
            }
        ])
    })

    it('should handle self-closing tags', () => {
        parser.parse("<tweet id=\"1\" name=\"tweet\"/>");

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

    it('should be in an IDLE state on a lone self-closing tag', () => {
        parser.parse("<tweet/>");
        expect(parser.state).toEqual(ParserState.IDLE);
    })

    it('should be in an OPEN state where there is still an open tag with a lone self-closing tag', () => {
        parser.parse("<tweet><question/>");
        expect(parser.state).toEqual(ParserState.OPEN);
    })

    it('should parse key-value attributes of self-closing tags', () => {
        parser.parse("<tweet id=\"1\" name=\"tweet\"/>");
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

    it('should parse key-value attributes of self-closing tags, nested', () => {
        parser.parse("<tweet><question id=\"1\" name=\"question\"/></tweet>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [{
                    tag: "question",
                    attributes: {
                        id: "1",
                        name: "question"
                    },
                    children: [],
                    content: ""
                }],
                content: ""
            }]
        })
    })

    it('should parse key-value attributes of self-closing tags, nested, mixed types', () => {
        parser.parse("<tweet id=\"1\"><question name=\"question\"/></tweet>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {
                    id: "1"
                },
                children: [{
                    tag: "question",
                    attributes: {
                        name: "question"
                    },
                    children: [],
                    content: ""
                }],
                content: ""
            }]
        })
    });

    it('should ERROR out on mismatched opening and closing tags', () => {
        parser.parse("<tweet></question>");
        expect(parser.state).toEqual(ParserState.ERROR);
    })

    it('should ERROR out on mismatched nested opening and closing tags', () => {
        parser.parse("<tweet><question></tweet>");
        expect(parser.state).toEqual(ParserState.ERROR);
    })

    it('should save the content of the error, nested, self-closing version', () => {
        parser.parse("<tweet><question/></question>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [
                    {
                        tag: "question",
                        attributes: {},
                        children: [],
                        content: ""
                    },
                    {
                        tag: "error",
                        attributes: {},
                        children: [],
                        content: "Expected closing tag for \"tweet\" but found \"question\""
                    }
                ],
                content: ""
            }]
        })
    })

    it('should save the content of the error', () => {
        parser.parse("<tweet></question>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [
                    {
                        tag: "error",
                        attributes: {},
                        children: [],
                        content: "Expected closing tag for \"tweet\" but found \"question\""
                    }
                ],
                content: ""
            }]
        })
    })

    it('should save the content of the error, nested version', () => {
        parser.parse("<tweet><question></tweet>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [
                    {
                        tag: "question",
                        attributes: {},
                        children: [{
                            tag: "error",
                            attributes: {},
                            children: [],
                            content: "Expected closing tag for \"question\" but found \"tweet\""
                        }],
                        content: ""
                    },
                ],
                content: ""
            }]
        })
    })

    it('should gracefully recover from an error', () => {
        parser.parse("<tweet></question>");
        parser.parse("<question></question>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [
                    {
                        tag: "error",
                        attributes: {},
                        children: [],
                        content: "Expected closing tag for \"tweet\" but found \"question\""
                    },
                    {
                        tag: "question",
                        attributes: {},
                        children: [],
                        content: ""
                    }
                ],
                content: ""
            }]
        })
    })

    it('should gracefully recover from an error, mixed content', () => {
        parser.parse("<tweet></question>");
        parser.parse("Hello</tweet>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {},
                children: [
                    {
                        tag: "error",
                        attributes: {},
                        children: [],
                        content: "Expected closing tag for \"tweet\" but found \"question\""
                    },
                    {
                        tag: "text",
                        attributes: {},
                        children: [],
                        content: "Hello"
                    }
                ],
                content: "",
            }],
        })
    })

    it('should gracefully recover from an error, closing tag only', () => {
        parser.parse("</question>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "error",
                attributes: {},
                children: [],
                content: "Unexpected closing tag \"question\""
            }]
        })
    })

    it('should gracefully recover from an error, start with closing tag, then open tag', () => {
        parser.parse("</question><tweet>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "error",
                attributes: {},
                children: [],
                content: "Unexpected closing tag \"question\""
            }, {
                tag: "tweet",
                attributes: {},
                children: [],
                content: ""
            }]
        })
    })

    it('should interpret `<\"` as text', () => {
        parser.parse("<\"");
        parser.end();
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "text",
                attributes: {},
                children: [],
                content: "<\""
            }]
        })
    })

    it('should interpret `<\'` as text', () => {
        parser.parse("<'");
        parser.end();
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "text",
                attributes: {},
                children: [],
                content: "<'"
            }]
        })
    })

    it('should interpret `<>` as text', () => {
        parser.parse("<>");
        parser.end();
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "text",
                attributes: {},
                children: [],
                content: "<>"
            }]
        })
    })

    it('should have raw text nodes', () => {
        parser.parse("Hello");
        parser.end();

        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{

                tag: "text",
                attributes: {},
                children: [],
                content: "Hello"
            }]
        })
    })

    it('non-text content field should have raw xml content', () => {
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
                content: "<tweet>Hello</tweet>"
            }]
        })
    })
})