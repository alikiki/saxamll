import { describe, it, expect } from 'vitest';
import { simple_classification } from '../examples/simple_classification';
import { simple_async_classification } from '../examples/simple_async_classification';
import { image_search } from '../examples/image_search';
import { model_router } from '../examples/model_router';

describe('SaxaMLL - Examples', () => {
    it('simple_classification.ts', () => {
        const response = simple_classification();
        expect(response).toBe("positive");
    })

    it('simple_async_classification.ts', async () => {
        const response = await simple_async_classification();
        expect(response).toBe("positive");
    })

    it('image_search.ts', async () => {
        const response = await image_search();
        expect(response).toBe(`I really like cats. Look at this one! <img src="https://example.com/image1.jpg" alt="Cute cat">They're so cute!`);
    })

    it('model_router.ts', () => {
        const response = model_router();
        expect(response).toBe("You are an emotional model.");
    })
})