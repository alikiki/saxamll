import { XMLNode } from "./types/index";

function getText(node: XMLNode): string {
    if (node.tag === "text") {
        return node.content!;
    }

    let textCollector: string = "";
    for (const child of node.children) {
        textCollector += getText(child);
    }

    return textCollector;
}

export { getText };