# saxaMLL

`saxaMLL` is a event-driven incremental SAX parser for your LLM interaction needs.

## Features
- No frills: pure text-to-text parsing
- Prompt generator for your custom XML tags

## Get started

```
import {SaxaMLLEmitter, SaxaMLLParser, getText} from 'saxamll';

const handler = new SaxaMLLEmitter();

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
* Returns text, depending on the results of an API.
* Example:
*   - Input: "<dataToCall query="barack obama image" onSuccess="Here is an image of Barack Obama: " onFailure="">"
*   - Output: If successful: "Here is an image of Barack Obama: ...". If failure: "".
*/
handler.onTagOpen('dataToCall', async (node) => {
    const onSuccessText = node.onSuccess;
    const onFailureText = node.onFailure;

    const response = await fetch(...SOME_API...);
    
    if (response.status !== 200) return onFailureText;
    
    const responseText = await response.text;
    const modifiedResponse = `${onSuccessText} {responseText}`.

    return modifiedResponse;
})

handler.onTagClose('classification', async (node) => {
    const text = getText(node);
    return Promise.resolve(text);
})
```

## Examples
- [Lapin](https://lapin.hajeon.xyz/) uses SaxaMLL under-the-hood to create dyanmically updating threads.