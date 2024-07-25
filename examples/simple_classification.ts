/**
 * Simple classification of text.
 */

import { getText, SaxaMLLParser, XMLNodeDescription } from "../src";
import { XMLNode } from "../src/types";

// On the generator side
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
const classificationPrompt = classificationTag.getPrompt();


// On the parser side
const saxParser = new SaxaMLLParser();

// When </classification> is encountered, we print the text inside the <classification> tags.
saxParser.emitter.addHandler('tagClose', classificationTag, (node: XMLNode) => {
    console.log(getText(node));
})

// // Also a valid way of setting handler:  vvvvvvvvvvvvvvvvv
// saxParser.emitter.addHandler('tagClose', "classification", (node: XMLNode) => {
//     console.log(getText(node));
// })

