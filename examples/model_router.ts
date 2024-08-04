/**
 * Take actions depending on the XML tags encountered.
 */

import { SaxaMLLParser, XMLNodeDescription } from "../src";

export const model_router = () => {
    const routerTag = new XMLNodeDescription({
        tag: "router",
        description: "Routes the message to the appropriate model.",
        selfClosing: true,
        attributes: {
            model: "The model to route the message to. Your choices are: 'emotional' and 'technical'"
        }
    })
    routerTag.setExamples([
        {
            input: "Today was a shitty day...",
            output: "I would classify this model as <router model='emotional'/>"
        },
        {
            input: "How do I change my password?",
            output: "<router model='technical'/>"
        },
    ])

    const saxParser = new SaxaMLLParser();
    let additionalModelPrompt = "";

    saxParser.executor.upon('update').for("root").do(([parent, child, isCommitted]) => {
        const classification = child.attributes.model;

        if (classification === "emotional") {
            additionalModelPrompt = "You are an emotional model."
        } else {
            additionalModelPrompt = "You are a technical model."
        }
    });

    saxParser.parse("<router model='emotional'/>");

    return additionalModelPrompt;
}