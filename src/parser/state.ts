export const enum ParserState {
    IDLE = 0,
    // Inside a scope
    OPEN = 1,
    // `<` has been encountered and potentially inside of a tag
    OPENTAG = 2,

    CLOSETAG = 3,
    CLOSETAGLONE = 4,
    TAGNAME = 5,
    ATTRKEY = 6,
    ATTRVALUEREADY = 7,
    ATTRVALUE = 8,
    TEXT = 9,
    ERROR = 10
}