import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLParser, ParserState } from "../src";


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
                content: "",
                pre: "<tweet>",
                type: "element"
            }],
            type: "element"
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
                    content: "",
                    pre: "<question>",
                    type: "element"
                }],
                content: "",
                pre: "<tweet>",
                type: "element"
            }],
            type: "element"
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
                    content: "Hello",
                    type: "text"
                }],
                content: "",
                pre: "<tweet>",
                post: "</tweet>",
                type: "element"
            }],
            type: "element"
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
                    content: "Hello ",
                    type: "text"
                }, {
                    tag: "question",
                    attributes: {},
                    children: [],
                    content: "",
                    pre: "<question>",
                    post: "</question>",
                    type: "element"
                }],
                content: "",
                pre: "<tweet>",
                post: "</tweet>",
                type: "element"
            }],
            type: "element"
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
                content: "",
                pre: "<tweet>",
                type: "element"
            }],
            type: "element"
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
                content: "",
                pre: "<tweet id=\"1\">",
                type: "element"
            }],
            type: "element"
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
                content: "",
                pre: "<tweet id=\"1\" name=\"tweet\">",
                type: "element"
            }],
            type: "element"
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
                    content: "",
                    pre: "<question q=\"what is life?\">",
                    post: "</question>",
                    type: "element"
                }],
                content: "",
                pre: "<tweet id=\"1\" name=\"tweet\">",
                post: "</tweet>",
                type: "element"
            }],
            type: "element"
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
                content: "< 10",
                type: "text"
            }],
            type: "element"
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
                content: "tweet >",
                type: "text"
            }],
            type: "element"
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
                content: "10 < 20, but 20 > 5",
                type: "text"
            }],
            type: "element"
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
                content: "",
                pre: "<tweet id = \"1\">",
                type: "element"
            }],
            type: "element"
        })
    })

    it.skip('should recogize when a new tag is being opened', () => {
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
                content: "",
                pre: "<tweet id=\"1\" name=\"tweet\"/>",
                type: "element"
            }],
            type: "element"
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
                    content: "",
                    pre: "<question q=\"what is life?\">",
                    post: "</question>",
                    type: "element"
                }],
                content: "",
                pre: "<tweet id=\"1\" name=\"tweet\">",
                post: "</tweet>",
                type: "element"
            }],
            type: "element"
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
                content: "",
                pre: "<tweet id=\"1\" name=\"tweet\"/>",
                type: "element"
            }],
            type: "element"
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
                    content: "",
                    pre: "<question id=\"1\" name=\"question\"/>",
                    type: "element"
                }],
                content: "",
                pre: "<tweet>",
                post: "</tweet>",
                type: "element"
            }],
            type: "element"
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
                    content: "",
                    pre: "<question name=\"question\"/>",
                    type: "element"
                }],
                content: "",
                pre: "<tweet id=\"1\">",
                post: "</tweet>",
                type: "element"
            }],
            type: "element"
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
                        content: "",
                        pre: "<question/>",
                        type: "element"
                    },
                    {
                        tag: "error",
                        attributes: {},
                        children: [],
                        content: "Expected closing tag for \"tweet\" but found \"question\"",
                        post: "</question>",
                        type: "error"
                    }
                ],
                content: "",
                pre: "<tweet>",
                type: "element"
            }],
            type: "element"
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
                        content: "Expected closing tag for \"tweet\" but found \"question\"",
                        post: "</question>",
                        type: "error"
                    }
                ],
                content: "",
                pre: "<tweet>",
                type: "element"
            }],
            type: "element"
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
                            content: "Expected closing tag for \"question\" but found \"tweet\"",
                            post: "</tweet>",
                            type: "error"
                        }],
                        content: "",
                        pre: "<question>",
                        type: "element"
                    },
                ],
                content: "",
                pre: "<tweet>",
                type: "element"
            }],
            type: "element"
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
                        content: "Expected closing tag for \"tweet\" but found \"question\"",
                        post: "</question>",
                        type: "error"
                    },
                    {
                        tag: "question",
                        attributes: {},
                        children: [],
                        content: "",
                        pre: "<question>",
                        post: "</question>",
                        type: "element"
                    }
                ],
                content: "",
                pre: "<tweet>",
                type: "element"
            }],
            type: "element"
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
                        content: "Expected closing tag for \"tweet\" but found \"question\"",
                        post: "</question>",
                        type: "error"
                    },
                    {
                        tag: "text",
                        attributes: {},
                        children: [],
                        content: "Hello",
                        type: "text"
                    }
                ],
                content: "",
                pre: "<tweet>",
                post: "</tweet>",
                type: "element"
            }],
            type: "element"
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
                content: "Unexpected closing tag \"question\"",
                post: "</question>",
                type: "error"
            }],
            type: "element"
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
                content: "Unexpected closing tag \"question\"",
                post: "</question>",
                type: "error"
            }, {
                tag: "tweet",
                attributes: {},
                children: [],
                content: "",
                pre: "<tweet>",
                type: "element"
            }],
            type: "element"
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
                content: "<\"",
                type: "text"
            }],
            type: "element"
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
                content: "<'",
                type: "text"
            }],
            type: "element"
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
                content: "<>",
                type: "text"
            }],
            type: "element"
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
                content: "Hello",
                type: "text"
            }],
            type: "element"
        })
    })


    it('special characters inside attribute values should be preserved', () => {
        parser.parse("<tweet id=\"1\" name=\"<tw/e/'e=t>\"/>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {
                    id: "1",
                    name: "<tw/e/'e=t>"
                },
                children: [],
                content: "",
                pre: "<tweet id=\"1\" name=\"<tw/e/'e=t>\"/>",
                type: "element"
            }],
            type: "element"
        })
    })

    it('does not error out on single quotes when double quotes are used for attribute values', () => {
        parser.parse(`<tweet id="'something'">`)
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {
                    id: "'something'"
                },
                children: [],
                content: "",
                pre: `<tweet id="'something'">`,
                type: "element"
            }],
            type: "element"
        })
    })

    it('encounter floating text inside a tag', () => {
        parser.parse("<tweet id=\"1\"<asdf>");
        parser.end();
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "tweet",
                attributes: {
                    id: "1"
                },
                children: [],
                content: "",
                pre: "<tweet id=\"1\"",
                type: "element"
            }, {
                tag: "error",
                attributes: {},
                children: [],
                content: "Unexpected opening tag '<' after opening tag \"tweet\"",
                post: "<asdf>",
                type: "error"
            }],
            type: "element"
        })
    })

    it('can interpret mixed content from the root node', () => {
        parser.parse("what is life? <answer>42</answer>");
        expect(parser.ast).toEqual({
            tag: "root",
            attributes: {},
            children: [{
                tag: "text",
                attributes: {},
                children: [],
                content: "what is life? ",
                type: "text"
            }, {
                tag: "answer",
                attributes: {},
                children: [{
                    tag: "text",
                    attributes: {},
                    children: [],
                    content: "42",
                    type: "text"
                }],
                content: "",
                pre: "<answer>",
                post: "</answer>",
                type: "element"
            }],
            type: "element"
        })
    })
})