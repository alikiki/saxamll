# saxaMLL

`saxaMLL` is a event-driven incremental SAX parser for your LLM interaction needs.

## Features
- No frills: pure text-to-text parsing
- Prompt generator for your custom XML tags

## Get started

```
import {SaxaMLLEmitter, SaxaMLLParser, getText, SaxaMLLGenerator} from 'saxamll';

const sax = new SaxaMLLParser();

sax.emitter.addHandler('tagClose', 'question', (node) => {
    const text = getText(node);
    console.log(text);
})


/**
* Returns the text in between <question></question> tags.
* Example: 
*   - Input: "<question>What's your name?</question>"
*   - Output: "What's your name?"
*/
handler.onTagClose('question', async (node) => {
    const text = getText(node);
    return Promise.resolve(text);
})

/**
 * Classify text
 * Example:
 *  - Input: "<sentenceToClassify>SVD is the swiss army knife of linear algebra</sentenceToClassify>"
 *  - Output: "<"
 */
const prompt = "<instructions>You are to classify the text.</instructions><task><sentenceToClassify></sentenceToClassify></task>"
const modifiedPrompt = SaxaMLLGenerator.augment(prompt);

const classificationXML: new XMLNodeDescription({
    description: "There are two classifications: `blue` and `red`.",
    tag: "classification",
    attributes: {
        optionA: "blue",
        optionB: "red"
    }
})
classificationXML.addExamples([
    {
        input: "",
        expected: "<classification>something</classification>"
    }
])

sax.emitter.onTagClose(classificationXML, (node) => {
    console.log(node.attributes.optionA)
})


/**
* Returns text, depending on the results of an API.
* Example:
*   - Input: "<dataToCall query="barack obama image" onSuccess="Here is an image of Barack Obama: " onFailure="">"
*   - Output: If successful: "Here is an image of Barack Obama: ...". If failure: "".
*/

const dataToCall: XMLNodeDescription = {
    tag: 'dataToCall',
    description: "",
    attributes: {
        onSuccess: "",
        onFailure: "",
    }
}

// Strings work too!
handler.onTagOpen('dataToCall', async (node) => {
    const onSuccessText = node.onSuccess;
    const onFailureText = node.onFailure;

    const response = await fetch(...SOME_API...);
    
    if (response.status !== 200) return onFailureText;
    
    const responseText = await response.text;
    const modifiedResponse = `${onSuccessText} ${responseText}`;
})
```

## Examples
- [Lapin](https://lapin.hajeon.xyz/) uses SaxaMLL under-the-hood to create dyanmically updating threads.