import { XMLNode } from "./types/index";

function getText(node: XMLNode): string {
    if (node.type === "text") {
        return node.content!;
    }

    if (node.children === undefined) {
        return "";
    }

    let textCollector: string = "";
    for (const child of node.children) {
        textCollector += getText(child);
    }

    return textCollector;
}

function getRaw(node: XMLNode): string {
    if (node.type === "text") {
        return getRawTextConstructor(node);
    }

    let textCollector: string = "";
    const pre = node.pre ? node.pre : "";
    const post = node.post ? node.post : "";

    for (const child of node.children) {
        textCollector += getRaw(child);
    }

    return pre + textCollector + post;

}

function getRawTextConstructor(node: XMLNode): string {
    const pre = node.pre ? node.pre : "";
    const post = node.post ? node.post : "";
    const content = node.content ? node.content : "";



    return pre + content + post;
}

export { getText, getRaw };