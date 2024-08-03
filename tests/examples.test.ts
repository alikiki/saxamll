import { describe, it, expect } from 'vitest';
import { simple_classification } from '../examples/simple_classification';
import { simple_async_classification } from '../examples/simple_async_classification';
import { image_search } from '../examples/image_search';

describe('SaxaMLL - Examples', () => {
    it('simple_classification.ts', () => {
        const response = simple_classification();
        expect(response).toBe("positive");
    })

    it('simple_await_classification.ts', async () => {
        const response = await simple_async_classification();
        expect(response).toBe("positive");
    })

    it('image_search.ts', async () => {
        const response = await image_search();
        expect(response).toBe("Lobster found!");
    })
})