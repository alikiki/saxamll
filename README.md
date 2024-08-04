# saxaMLL

`saxaMLL` is a event-driven incremental SAX parser for your LLM interaction/orchestration needs.

## Features
- No tool-calling APIs necessary
- No frills - just pure text parsing
- Prompt generator for your custom XML tags

## Get started

Head over to the [docs](https://saxamll.neoj-studios.com/) for more information.

### Installation

```
npm install saxamll
```

### Example

```typescript
import { getText, XMLNodeDescription, SaxaMLLParser } from "saxamll";

/*
First, define an XML description.
*/
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

/*
This generates a description of the <classification> tags.
*/
const classificationDescription = classificationTag.getPrompt();

const saxParser = new SaxaMLLParser();

/*
When </classification> is encountered, we will save the text
inside the <classification> tags inside `response`.
*/
let response;
saxParser.executor.upon('tagClose').for(classificationTag).do((node: XMLNode) => {
    response = getText(node);
});


/* 
Parse the input all at once
*/
saxParser.parse("<classification>positive</classification>");
console.log(response); // "positive"

/*
Or, parse in an online fashion
*/
const streamExample = [
    "<class",
    "ification",
    ">",
    "positive",
    "</",
    "classification",
    ">"
]
    
for (let delta of streamExample) {
    saxParser.parse(delta);
}
console.log(response); // "positive"
```

## Examples
- [Lapin](https://lapin.hajeon.xyz/) uses SaxaMLL under-the-hood to create dynamic UI.