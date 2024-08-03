import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLExecutor, SaxaMLLParser, getText } from "../src";
import { XMLNode } from '../src/types';

describe('SaxaMLL - Integration', () => {
    it('should be read the contents of a single xml tag', () => {
        const parser = new SaxaMLLParser();
        let results = "";
        const eventName = parser.executor.upon('tagClose').for('tweet').do((node: XMLNode) => {
            results = getText(node);
        }).getEventName();

        parser.parse("<tweet>Hello</tweet>");
        parser.end();
        expect(results).toBe("Hello");
    })

    it('should be able to interpret attributes on tagOpen', () => {
        const parser = new SaxaMLLParser();
        let results = "";
        parser.executor.upon('tagOpen').for('tweet').do((node: XMLNode) => {
            results = node.attributes.id;
        })

        parser.parse("<tweet id=\"1\">");
        expect(results).toBe("1");
    })

    it('should be able to get updates', () => {
        const textUpdates = [
            "Hello",
            "World"
        ]

        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').do((node: XMLNode) => {
            results = getText(node);
        })

        parser.parse(textUpdates[0]);
        parser.update();
        expect(results).toBe(textUpdates[0]);

        parser.parse(textUpdates[1]);
        parser.update();
        expect(results).toBe("HelloWorld");
    })

    it('should be able to get updates', () => {
        const textUpdates = [
            "Hello",
            "World"
        ]

        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').do((node: XMLNode) => {
            if (node.tag === "tweet") {
                results = getText(node);
            }
        })

        parser.parse("<tweet>Hel");
        parser.update();
        expect(results).toBe("Hel");

        parser.parse("lo</");
        parser.update();
        expect(results).toBe("Hello");

        parser.parse("tweet>");
        parser.update();
        expect(results).toBe("Hello");
    })

    it('should be able to get updates on a specific tag', () => {
        const textUpdates = [
            "Hello",
            "World"
        ]

        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').for('tweet').do((node: XMLNode) => {
            results = getText(node);
        })

        parser.parse("<tweet>Hel");
        parser.update();
        expect(results).toBe("Hel");

        parser.parse("lo</");
        parser.update();
        expect(results).toBe("Hello");

        parser.parse("tweet>");
        parser.update();
        expect(results).toBe("Hello");
    })
})
