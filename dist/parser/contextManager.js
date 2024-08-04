export default class SaxaMLLParserContextManager {
    constructor(executor) {
        this._currChildNode = { tag: "", attributes: {}, children: [], content: "", type: "element" };
        this._currAttrKey = "";
        this._currAttrValue = "";
        this._currQuoteUsedForAttrValue = "";
        this.executor = executor;
    }
    setExecutor(executor) {
        this.executor = executor;
    }
    setNodeType(type) {
        this._currChildNode.type = type;
    }
    clearContext() {
        this.clearChildNode();
        this.clearAttrKey();
        this.clearAttrValue();
    }
    // Pre + Post
    get currPre() {
        return this._currChildNode.pre;
    }
    get currPost() {
        return this._currChildNode.post;
    }
    addToPre(s) {
        if (!this._currChildNode.pre)
            this._currChildNode.pre = "";
        this._currChildNode.pre += s;
    }
    addToPost(s) {
        if (!this._currChildNode.post)
            this._currChildNode.post = "";
        this._currChildNode.post += s;
    }
    setPre(s) {
        this._currChildNode.pre = s;
    }
    setPost(s) {
        this._currChildNode.post = s;
    }
    clearPre() {
        this._currChildNode.pre = "";
    }
    clearPost() {
        this._currChildNode.post = "";
    }
    clearRaw() {
        this.clearPre();
        this.clearPost();
    }
    // Child node
    get currChildNode() {
        return this._currChildNode;
    }
    isCurrChildEmpty() {
        return this._currChildNode.tag === "" && this._currChildNode.content === "";
    }
    addToContent(s) {
        this._currChildNode.content += s;
    }
    addToTagName(s) {
        this._currChildNode.tag += s;
    }
    setContent(s) {
        this._currChildNode.content = s;
    }
    setTagName(s) {
        this._currChildNode.tag = s;
    }
    clearChildNode() {
        this._currChildNode = { tag: "", attributes: {}, children: [], content: "", type: "element" };
    }
    // Attributes
    get currAttrKey() {
        return this._currAttrKey;
    }
    get currAttrValue() {
        return this._currAttrValue;
    }
    addToAttrKey(char) {
        this._currAttrKey += char;
    }
    addToAttrValue(s) {
        this._currAttrValue += s;
    }
    setAttrKey(s) {
        this._currAttrKey = s;
    }
    setAttrValue(s) {
        this._currAttrValue = s;
    }
    addAttr() {
        this._currChildNode.attributes[this._currAttrKey] = this._currAttrValue;
        this.clearAttrKey();
        this.clearAttrValue();
    }
    clearAttrKey() {
        this._currAttrKey = "";
    }
    clearAttrValue() {
        this._currAttrValue = "";
    }
    resetNodeType() {
        this._currChildNode.type = "element";
    }
    get currQuoteUsedForAttrValue() {
        return this._currQuoteUsedForAttrValue;
    }
    setQuoteUsedForAttrValue(s) {
        this._currQuoteUsedForAttrValue = s;
    }
    clearQuoteUsedForAttrValue() {
        this._currQuoteUsedForAttrValue = "";
    }
}
