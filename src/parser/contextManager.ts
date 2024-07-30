import { XMLNode } from "../types/index";
import SaxaMLLExecutor from "./executor";

export default class SaxaMLLParserContextManager {
    _currChildNode: XMLNode = { tag: "", attributes: {}, children: [], content: "" };
    _currAttrKey: string = "";
    _currAttrValue: string = "";

    public executor: SaxaMLLExecutor;

    constructor(executor: SaxaMLLExecutor) {
        this.executor = executor;
    }

    public setExecutor(executor: SaxaMLLExecutor) {
        this.executor = executor;
    }

    public clearContext() {
        this.clearChildNode();
        this.clearAttrKey();
        this.clearAttrValue();
    }

    // Child node
    public get currChildNode() {
        return this._currChildNode;
    }
    public isCurrChildEmpty() {
        return this._currChildNode.tag === "" && this._currChildNode.content === "";
    }
    public addToContent(s: string) {
        this._currChildNode.content += s;
    }
    public addToTagName(s: string) {
        this._currChildNode.tag += s;
    }
    public setContent(s: string) {
        this._currChildNode.content = s;
    }
    public setTagName(s: string) {
        this._currChildNode.tag = s;
    }
    public clearChildNode() {
        this._currChildNode = { tag: "", attributes: {}, children: [], content: "" };
    }

    // Attributes
    public get currAttrKey() {
        return this._currAttrKey;
    }

    public get currAttrValue() {
        return this._currAttrValue;
    }

    public addToAttrKey(char: string) {
        this._currAttrKey += char;
    }

    public addToAttrValue(s: string) {
        this._currAttrValue += s;
    }

    public setAttrKey(s: string) {
        this._currAttrKey = s;
    }

    public setAttrValue(s: string) {
        this._currAttrValue = s;
    }

    public addAttr() {
        this._currChildNode.attributes[this._currAttrKey] = this._currAttrValue;
        this.clearAttrKey();
        this.clearAttrValue();
    }

    public clearAttrKey() {
        this._currAttrKey = "";
    }

    public clearAttrValue() {
        this._currAttrValue = "";
    }
}