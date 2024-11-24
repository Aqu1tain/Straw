export enum Precedence {
    LOWEST = 1,
    EQUALS = 2,      // ==
    LESSGREATER = 3, // > or <
    SUM = 4,         // + or -
    PRODUCT = 5,     // * or /
    PREFIX = 6,      // -X or !X
    CALL = 7,        // myFunction(X)
    INDEX = 8        // array[index]
}
  
export function getTokenPrecedence(tokenType: string): Precedence {
    const precedences: { [key: string]: Precedence } = {
        'EQUALS': Precedence.EQUALS,
        'NOT_EQUALS': Precedence.EQUALS,
        'LESS': Precedence.LESSGREATER,
        'GREATER': Precedence.LESSGREATER,
        'PLUS': Precedence.SUM,
        'MINUS': Precedence.SUM,
        'MULTIPLY': Precedence.PRODUCT,
        'DIVIDE': Precedence.PRODUCT,
        'LPAREN': Precedence.CALL,
        'LBRACKET': Precedence.INDEX
    };

    return precedences[tokenType] || Precedence.LOWEST;
}