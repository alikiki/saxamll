export interface XMLNode {
    tag: string;
    type: "text" | "element" | "error";
    attributes: Record<string, string>;
    children: XMLNode[];
    content?: string;
    pre?: string;
    post?: string;
}
export interface XMLNodeDescriptionExample {
    input: string;
    output: string;
}
//# sourceMappingURL=index.d.ts.map