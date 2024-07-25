/**
 * Take actions depending on the XML tags encountered.
 */

import { SaxaMLLParser, XMLNodeDescription } from "../src";
import { XMLNode } from "../src/types";

// On the generator side
const imageSearchTag = new XMLNodeDescription({
    tag: "imageSearch",
    selfClosing: true,
    description: "Search for an image given a keyword. The `query` attribute should contain the keyword. The `onSuccess` attribute should contain text that is displayed when the image is found. The `onFailure` attribute should contain text that is displayed when the image is not found."
})


imageSearchTag.setExamples([
    {
        input: "",
        output: "<imageSearch query='lobster' onSuccess='Lobster found!' onFailure='Lobster not found!'></imageSearch>"
    },
    {
        input: "",
        output: "<imageSearch query='muhammad ali' onSuccess='Here is a photo of Muhammad Ali.' onFailure='Unfortunately, no photos of Muhammad Ali are available in the database.'/>"
    },
])



// On the parser side:
const saxParser = new SaxaMLLParser();

// The `tagOpen` event is triggered when all the attributes of <imageSearch> are parsed.
saxParser.emitter.addHandler('tagOpen', imageSearchTag, async (node: XMLNode) => {
    const onSuccess = node.attributes.onSuccess;
    const onFailure = node.attributes.onFailure;

    // Search for the image
    const query = node.attributes.query;
    const image = await fetch("https://api.unsplash.com/search/photos?query=" + query);
    const imageJson = await image.json();

    // If the image is found
    if (imageJson.results.length > 0) {
        console.log(onSuccess);
        console.log(`<img src="${imageJson.results[0].urls.full}"></img>`);
    } else {
        console.log(onFailure);
    }
})
