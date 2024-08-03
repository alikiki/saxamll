/**
 * Take actions depending on the XML tags encountered.
 */

import { SaxaMLLParser, XMLNodeDescription } from "../src";
import { XMLNode } from "../src/types";

export const image_search = async () => {
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
    let imageResponse = "";
    const pagePromises: Promise<any>[] = [];
    saxParser.executor.upon('tagOpen').for(imageSearchTag).do(async (node: XMLNode) => {
        // Search the wikipedia API
        const query = node.attributes.query;
        const onSuccess = node.attributes.onSuccess;
        const onFailure = node.attributes.onFailure;

        pagePromises.push(
            fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${query}&origin=*`)
                .then((result) => result.json())
                .then((json) => {
                    // Get the first page
                    const pages = json.query.pages;
                    const firstPage = pages[Object.keys(pages)[0]];

                    if (firstPage.thumbnail) {
                        imageResponse = onSuccess;
                    } else {
                        imageResponse = onFailure;
                    }
                })
        );
    })

    saxParser.parse("<imageSearch query='lobster' onSuccess='Lobster found!' onFailure='Lobster not found!'></imageSearch>");

    await Promise.all(pagePromises);

    return imageResponse;
}

