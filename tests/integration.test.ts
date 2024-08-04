import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLExecutor, SaxaMLLParser, getText } from "../src";
import { XMLNode } from '../src/types';

describe('SaxaMLL - Integration', () => {
    it('should be read the contents of a single xml tag', () => {
        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('tagClose').for('tweet').do((node: XMLNode) => {
            results = getText(node);
        })

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

    it('should be able to get updates on child', () => {
        const textUpdates = [
            "Hello",
            "World"
        ]

        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').do(([parent, child, isCommitted]) => {
            results = getText(child);
        })

        parser.parse(textUpdates[0]);
        parser.update();
        expect(results).toBe(textUpdates[0]);

        parser.parse(textUpdates[1]);
        parser.update();
        expect(results).toBe(textUpdates[1]);
    })

    it('should be able to get updates on parent', () => {
        const textUpdates = [
            "Hello",
            "World"
        ]

        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').do(([parent, child, isCommitted]) => {
            results = getText(parent);
        })

        parser.parse(textUpdates[0]);
        parser.update();
        expect(results).toBe(textUpdates[0]);

        parser.parse(textUpdates[1]);
        parser.update();
        expect(results).toBe("HelloWorld");
    })

    it('should be able to get updates on child, with non-root parent', () => {
        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').do(([parent, child, isCommitted]) => {
            if (parent.tag === "tweet" && isCommitted) {
                results = getText(child);
            }
        })

        parser.parse("<tweet>Hel");
        parser.update();
        expect(results).toBe("Hel");

        parser.parse("lo</");
        parser.update();
        expect(results).toBe("lo");

        parser.parse("tweet>");
        parser.update();
        expect(results).toBe("lo");
    })

    it('should be able to get updates on parent, with non-root parent', () => {
        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').do(([parent, child, isCommitted]) => {
            if (parent.tag === "tweet" && isCommitted) {
                results = getText(parent);
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
        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').for('tweet').do(([parent, child, isCommitted]) => {
            results = getText(parent);
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

    it('should be able to get updates on nested tags', () => {
        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').do(([parent, child, isCommitted]) => {
            results += getText(child);
        })

        parser.executor.upon('tagOpen').for('query').do((node: XMLNode) => {
            const query = node.attributes.query;
            results += query;
        })

        parser.parse("I want to know more about ");
        parser.update();
        expect(results).toBe("I want to know more about ");

        parser.parse("<query query=\"cats\"");
        parser.update();
        expect(results).toBe("I want to know more about ");

        parser.parse(">")
        parser.update();
        expect(results).toBe("I want to know more about cats");

        parser.parse(" Cats are cute</");
        parser.update();
        expect(results).toBe("I want to know more about cats Cats are cute");

        parser.parse("query>")
        parser.update();
        expect(results).toBe("I want to know more about cats Cats are cute");
    })

    it('should be able to get updates on nested tags, only root level', () => {
        const parser = new SaxaMLLParser();
        let results = "";

        parser.executor.upon('update').for('root').do(([parent, child, isCommitted]) => {
            results += getText(child);
        })

        parser.executor.upon('tagOpen').for('query').do((node: XMLNode) => {
            const query = node.attributes.query;
            results += query;
        })

        parser.parse("I want to know more about ");
        parser.update();
        expect(results).toBe("I want to know more about ");

        parser.parse("<query query=\"cats\"");
        parser.update();
        expect(results).toBe("I want to know more about ");

        parser.parse(">")
        parser.update();
        expect(results).toBe("I want to know more about cats");

        parser.parse(" Cats are cute</");
        parser.update();
        expect(results).toBe("I want to know more about cats");

        parser.parse("query>")
        parser.update();
        expect(results).toBe("I want to know more about cats");
    })
})
