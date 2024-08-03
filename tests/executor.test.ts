import { beforeEach, describe, it, expect } from 'vitest';
import { SaxaMLLExecutor, ExecutionHandlerBuilder, SaxaMLLParser } from "../src";

describe('SaxaMLL - ExecutionHandler', () => {
    it('should build without scope', () => {
        const executor = new SaxaMLLExecutor();
        const handler = new ExecutionHandlerBuilder(executor, 'tagClose');

        handler.for('random').do((node) => { return Promise.resolve("") });

        expect(handler.tag).toBe('random');
        expect(handler.scope.length).toBe(0);
        expect(handler.getEventName()).toBe('tagClose:random');
    })
})

describe('SaxaMLL - Executor', () => {
    it('should build event name', () => {
        const executor = new SaxaMLLExecutor();
        const eventName = executor.buildEventName('tagClose', 'random');

        expect(eventName).toBe('tagClose:random');
    })

    it('should add handler', () => {
        const executor = new SaxaMLLExecutor();
        const handler = new ExecutionHandlerBuilder(executor, 'tagClose');

        handler.for('random').do((node) => { return Promise.resolve("") });

        expect(executor.listeners('tagClose:random').length).toBe(1);
    })

    it('should emit event', async () => {
        const executor = new SaxaMLLExecutor();
        const handler = new ExecutionHandlerBuilder(executor, 'tagClose');

        let result;
        handler.for('random').do((node) => { result = "Hello"; return Promise.resolve("Hello") });

        await executor.emit('tagClose:random', {});

        expect(result).toBe('Hello');
    })
})
