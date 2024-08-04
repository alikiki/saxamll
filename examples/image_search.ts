/**
 * Take actions depending on the XML tags encountered.
 */

import { SaxaMLLParser, XMLNodeDescription, getText } from "saxamll";
import { XMLNode } from "../src/types";


export const image_search = async () => {
    const searchQueryTag = new XMLNodeDescription({
        tag: "search_query",
        description: "Initiates a search query for images and videos.",
        selfClosing: true,
        attributes: {
            query: "The search query.",
            onSuccess: "The message to display when the search is successful.",
            onFailure: "The message to display when the search is unsuccessful"
        }
    });

    searchQueryTag.setExamples([
        {
            input: 'I really like cats. <search_query query="cats" onSuccess="Look at this one!" onFailure="Sorry, I couldn\'t find any images."/> They are so so cute!',
            output: 'I really like cats. Look at this one! <img src="https://example.com/cute_cat.jpg" alt="Cute cat">'
        }
    ]);


    interface SearchResult {
        type: 'image' | 'video';
        url: string;
        title: string;
    }

    async function searchImages(query: string): Promise<SearchResult[]> {
        // Simulated image search API call
        return new Promise<SearchResult[]>((resolve) => {
            setTimeout(() => {
                resolve([
                    { type: 'image', url: 'https://example.com/image1.jpg', title: 'Cute cat' },
                    { type: 'image', url: 'https://example.com/image2.jpg', title: 'Playful kitten' },
                ]);
            }, 200);
        });
    }


    const saxParser = new SaxaMLLParser();
    let finalResponseCollector: string[] = [];
    let promises: Promise<string | void>[] = [];

    saxParser.executor.upon('tagOpen').for(searchQueryTag).do(async (node: XMLNode) => {
        const searchQuery = getText(node);
        const onSuccess = node.attributes?.onSuccess || '';
        const onFailure = node.attributes?.onFailure || '';

        finalResponseCollector.push("SEARCH_RESULT");

        const searchPromise = Promise.all([searchImages(searchQuery)])
            .then(([images]) => {
                const allResults = [...images];
                if (allResults.length > 0) {
                    const result = allResults[0]; // Just use the first result for simplicity
                    let resultHtml = onSuccess + ' ';
                    resultHtml += `<img src="${result.url}" alt="${result.title}">`;
                    return resultHtml;
                } else {
                    return onFailure;
                }
            });

        promises.push(searchPromise.then(resultHtml => {
            return resultHtml;
        }));
    });

    saxParser.executor.upon('update').for("root").do(([parent, node, isCommitted]) => {
        finalResponseCollector.push(getText(node));
    })


    // Streaming example
    const input = 'I really like cats. <search_query query="cats" onSuccess="Look at this one!" onFailure="Sorry, I couldn\'t find any images."></search_query> They\'re so cute!';

    let currentIndex = 0;
    while (currentIndex < input.length) {
        saxParser.parse(input[currentIndex]);
        saxParser.update();
        currentIndex++;
    }

    let finalResponse = "";
    for (const response of finalResponseCollector) {
        if (response === "SEARCH_RESULT") {
            finalResponse += await promises.shift();
            continue;
        }
        finalResponse += response;
    }

    return finalResponse;
}


const searchQueryTag = new XMLNodeDescription({
    tag: "search_query",
    description: "Initiates a search query for images and videos.",
    selfClosing: true,
    attributes: {
        query: "The search query.",
        onSuccess: "The message to display when the search is successful.",
        onFailure: "The message to display when the search is unsuccessful"
    }
});

searchQueryTag.setExamples([
    {
        input: 'I really like cats. <search_query query="cats" onSuccess="Look at this one!" onFailure="Sorry, I couldn\'t find any images."/> They are so so cute!',
        output: 'I really like cats. Look at this one! <img src="https://example.com/cute_cat.jpg" alt="Cute cat">'
    }
]);


