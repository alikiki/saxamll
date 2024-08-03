/**
 * Simple classification of text.
 */

import { getText, SaxaMLLParser, XMLNodeDescription } from "../src";
import { XMLNode } from "../src/types";

// On the generator side
export const simple_classification = () => {
    const classificationTag = new XMLNodeDescription({
        tag: "classification",
        description: "Put 'positive' if the text inside '<sentence></sentence> tags is positive. Put 'negative' if the text is negative"
    })

    classificationTag.setExamples([
        {
            input: "<sentence>I'm eating lobsters and I'm so happy.</sentence>",
            output: "<classification>positive</classification>"
        }
    ])

    /** Returns a prompt that you can append to your system prompt.
     * This one will look like:
     * ```
     * <classification></classification>: Put 'positive' if the text inside '<sentence></sentence> tags is positive. Put 'negative' if the text is negative.
     * 
     * Examples:
     *  input: <sentence>I'm eating lobsters and I'm so happy.</sentence>
     *  output: <classification>positive</classification>
     * ```
     * 
     * Append this to your system prompt.
     */
    const classificationPrompt = classificationTag.prompt;

    // On the parser side
    const saxParser = new SaxaMLLParser();

    // When </classification> is encountered, we print the text inside the <classification> tags.
    let response;
    saxParser.executor.upon('tagClose').for(classificationTag).do((node: XMLNode) => {
        response = getText(node);
    });

    // Parse the input
    saxParser.parse("<classification>positive</classification>");
    saxParser.end();

    return response;
}