import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLExecutor, ExecutionHandlerBuilder, SaxaMLLParser } from "../src";

describe('SaxaMLL - ExecutionHandler', () => {
    it('should build correctly', () => {
        const executor = new SaxaMLLExecutor();
        const handler = new ExecutionHandlerBuilder(executor, 'tagClose');

        handler.for('random').inside('a', 'b', 'c').do((node) => { return Promise.resolve("") });

        expect(handler.tag).toBe('random');
        expect(handler.scope).toEqual(['a', 'b', 'c']);
    })
    it('should build without scope', () => {
        const executor = new SaxaMLLExecutor();
        const handler = new ExecutionHandlerBuilder(executor, 'tagClose');

        handler.for('random').do((node) => { return Promise.resolve("") });

        expect(handler.tag).toBe('random');
        expect(handler.scope.length).toBe(0);
    })
})

describe('SaxaMLL - Execution', () => {
    it('simple execution', async () => {
        const executor = new SaxaMLLExecutor();
        const tagEvent = executor.on('tagOpen').for('random').do((node) => {
            return Promise.resolve(node.tag);
        });

        executor.emit(tagEvent.getEventName(), { tag: 'random' });
        const result = await executor.getResults('tagOpen', 'random', []);

        expect(result).toBe('random');
    })

    it('execution with scope', async () => {
        const executor = new SaxaMLLExecutor();
        const tagEvent = executor.on('tagOpen').for('random').inside('a', 'b', 'c').do((node) => {
            return Promise.resolve(node.tag);
        });

        executor.emit(tagEvent.getEventName(), { tag: 'random' });
        const result = await executor.getResults('tagOpen', 'random', ['a', 'b', 'c']);

        expect(result).toBe('random');
    })

    it('execution with partial scope', async () => {
        const executor = new SaxaMLLExecutor();

        // expose a collector
        // e.g. const contentBlockAccumulator = new Accumulator();
        const contentTagEventAccumulate = (node) => {
            const responses: Promise<string>[] = [];
            for (let n of node.children) {
                console.log(n);
                switch (n.tag) {
                    case 'text':
                        // Put all the shit in the accumulator
                        responses.push(Promise.resolve(n.content!));
                        break;
                    case 'image':
                        const image = new Promise<string>((resolve) => {
                            setTimeout(() => {
                                resolve(n.tag);
                            }, 1000);
                        });
                        responses.push(image);
                        break;
                }
            }

            return Promise.all(responses);
        }

        const contentBlockEvent = executor.on('tagClose').for('contentBlock').do(async (node) => {
            console.log(node);
            let response = "Here are the contents for today. ";
            for (let n of node.children) {
                console.log(n);
                switch (n.tag) {
                    case 'content':
                        const r = await contentTagEventAccumulate(n);
                        response += r.join("");
                        break;
                }
            }

            return response;
        })



        executor.emit(
            contentBlockEvent.getEventName(),
            {
                tag: "contentBlock",
                attributes: {},
                children: [
                    {
                        tag: "content",
                        attributes: {},
                        children: [
                            {
                                tag: "image",
                                attributes: {},
                                children: [],
                                content: ""
                            },
                            {
                                tag: "text",
                                attributes: {},
                                children: [],
                                content: "Hello world"
                            }
                        ]
                    },
                    {
                        tag: "content",
                        attributes: {},
                        children: [
                            {
                                tag: "image",
                                attributes: {},
                                children: [],
                                content: ""
                            },
                            {
                                tag: "text",
                                attributes: {},
                                children: [],
                                content: "Hello world, part 2"
                            }
                        ]
                    }
                ]
            }
        );

        const result = await executor.getResults('tagClose', 'contentBlock', []);

        expect(result).toEqual("Here are the contents for today. imageHello worldimageHello world, part 2");
    })

    it('', () => {
        const executor = new SaxaMLLExecutor();

        const tagEventResponse = await executor.on('tagOpen').for('random').do((node) => {
            return Promise.resolve(node.tag);
        });

        console.log(tagEventResponse);
    })

    it('', () => {
        const parser = new SaxaMLLParser();

        parser.executor.on('tagOpen').for('random').do(async (node) => {
            const currentBatch = parser.executor.get('something');
            const apiResponse = await fetch('https://api.example.com/v1/random');
            const textDelta = await apiResponse.text();
            parser.executor.set('something', textDelta);
        });

        const finalResponse = [];

        function userDefinedHandleFn(data) {
            const currentResults = parser.executor.get('something');
            const textDelta = data + currentResults;

            finalResponse.push(textDelta);
        }



        while (true) {
            parser.parse(textDelta);

            userDefinedHandleFn(parser.executor.flush());
        }

        console.log(finalResponse);


    })

    it('', () => {
        const executor = new SaxaMLLExecutor();

        const
    })
})
