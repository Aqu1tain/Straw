// packages/compiler/src/lexer/types.ts

export enum TokenType {
    // Literals
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    IDENTIFIER = 'IDENTIFIER',
    
    // Keywords
    FN = 'FN',
    LET = 'LET',
    CONST = 'CONST',
    IF = 'IF',
    ELSE = 'ELSE',
    RETURN = 'RETURN',
    WHILE = 'WHILE',
    FOR = 'FOR',
    IN = 'IN',
    COMPONENT = 'COMPONENT',
    PROPS = 'PROPS',
    STATE = 'STATE',
    RENDER = 'RENDER',
    ASYNC = 'ASYNC',
    AWAIT = 'AWAIT',
    TRY = 'TRY',
    CATCH = 'CATCH',
    
    // Operators
    PLUS = 'PLUS',           // +
    MINUS = 'MINUS',         // -
    MULTIPLY = 'MULTIPLY',   // *
    DIVIDE = 'DIVIDE',       // /
    ASSIGN = 'ASSIGN',       // =
    EQUALS = 'EQUALS',       // ==
    NOT_EQUALS = 'NOT_EQUALS', // !=
    GREATER = 'GREATER',     // >
    LESS = 'LESS',          // <
    
    // Delimiters
    LPAREN = 'LPAREN',      // (
    RPAREN = 'RPAREN',      // )
    LBRACE = 'LBRACE',      // {
    RBRACE = 'RBRACE',      // }
    LBRACKET = 'LBRACKET',  // [
    RBRACKET = 'RBRACKET',  // ]
    COMMA = 'COMMA',        // ,
    DOT = 'DOT',           // .
    COLON = 'COLON',       // :
    ARROW = 'ARROW',       // =>
    SEMICOLON = 'SEMICOLON',  // ;
    
    // Special
    EOF = 'EOF',
    ILLEGAL = 'ILLEGAL'
  }
  
  export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
  }
  
  export interface Position {
    line: number;
    column: number;
  }