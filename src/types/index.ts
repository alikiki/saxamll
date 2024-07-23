export interface XMLNode {
    tag: string;
    attributes: Record<string, string>;
    children: XMLNode[];
    content?: string;
}

export interface XMLNodeDescriptionExample {
    input: string,
    output: string
}