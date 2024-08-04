function getText(node) {
    if (node.type === "text") {
        return node.content;
    }
    if (node.children === undefined) {
        return "";
    }
    let textCollector = "";
    for (const child of node.children) {
        textCollector += getText(child);
    }
    return textCollector;
}
function getRaw(node) {
    if (node.type === "text") {
        return getRawTextConstructor(node);
    }
    let textCollector = "";
    const pre = node.pre ? node.pre : "";
    const post = node.post ? node.post : "";
    if (node.children === undefined) {
        return pre + post;
    }
    for (const child of node.children) {
        textCollector += getRaw(child);
    }
    return pre + textCollector + post;
}
function getRawTextConstructor(node) {
    const pre = node.pre ? node.pre : "";
    const post = node.post ? node.post : "";
    const content = node.content ? node.content : "";
    return pre + content + post;
}
export { getText, getRaw };
