import { Lexer } from '../lexer';
import { TokenType } from '../types';

describe('Lexer', () => {
  describe('Basic Tokens', () => {
    test('tokenizes simple let statement', () => {
      const input = 'let x = 5';
      const lexer = new Lexer(input);
      
      const expectedTokens = [
        { type: TokenType.LET, value: 'let' },
        { type: TokenType.IDENTIFIER, value: 'x' },
        { type: TokenType.ASSIGN, value: '=' },
        { type: TokenType.NUMBER, value: '5' },
        { type: TokenType.EOF, value: '' }
      ];

      verifyTokens(lexer, expectedTokens);
    });

    test('tokenizes function declaration', () => {
      const input = 'fn add(a: int, b: int): int { return a + b }';
      const lexer = new Lexer(input);
      
      const expectedTokens = [
        { type: TokenType.FN, value: 'fn' },
        { type: TokenType.IDENTIFIER, value: 'add' },
        { type: TokenType.LPAREN, value: '(' },
        { type: TokenType.IDENTIFIER, value: 'a' },
        { type: TokenType.COLON, value: ':' },
        { type: TokenType.IDENTIFIER, value: 'int' },
        { type: TokenType.COMMA, value: ',' },
        { type: TokenType.IDENTIFIER, value: 'b' },
        { type: TokenType.COLON, value: ':' },
        { type: TokenType.IDENTIFIER, value: 'int' },
        { type: TokenType.RPAREN, value: ')' },
        { type: TokenType.COLON, value: ':' },
        { type: TokenType.IDENTIFIER, value: 'int' },
        { type: TokenType.LBRACE, value: '{' },
        { type: TokenType.RETURN, value: 'return' },
        { type: TokenType.IDENTIFIER, value: 'a' },
        { type: TokenType.PLUS, value: '+' },
        { type: TokenType.IDENTIFIER, value: 'b' },
        { type: TokenType.RBRACE, value: '}' },
        { type: TokenType.EOF, value: '' }
      ];

      verifyTokens(lexer, expectedTokens);
    });
  });

  describe('Complex Types and Operators', () => {
    test('tokenizes array syntax', () => {
      const input = 'let arr = [1, 2, 3]';
      const lexer = new Lexer(input);
      
      const expectedTokens = [
        { type: TokenType.LET, value: 'let' },
        { type: TokenType.IDENTIFIER, value: 'arr' },
        { type: TokenType.ASSIGN, value: '=' },
        { type: TokenType.LBRACKET, value: '[' },
        { type: TokenType.NUMBER, value: '1' },
        { type: TokenType.COMMA, value: ',' },
        { type: TokenType.NUMBER, value: '2' },
        { type: TokenType.COMMA, value: ',' },
        { type: TokenType.NUMBER, value: '3' },
        { type: TokenType.RBRACKET, value: ']' },
        { type: TokenType.EOF, value: '' }
      ];

      verifyTokens(lexer, expectedTokens);
    });

    test('tokenizes arrow functions and comparisons', () => {
      const input = 'const add = (a, b) => a + b if (x == y) { }';
      const lexer = new Lexer(input);
      
      const expectedTokens = [
        { type: TokenType.CONST, value: 'const' },
        { type: TokenType.IDENTIFIER, value: 'add' },
        { type: TokenType.ASSIGN, value: '=' },
        { type: TokenType.LPAREN, value: '(' },
        { type: TokenType.IDENTIFIER, value: 'a' },
        { type: TokenType.COMMA, value: ',' },
        { type: TokenType.IDENTIFIER, value: 'b' },
        { type: TokenType.RPAREN, value: ')' },
        { type: TokenType.ARROW, value: '=>' },
        { type: TokenType.IDENTIFIER, value: 'a' },
        { type: TokenType.PLUS, value: '+' },
        { type: TokenType.IDENTIFIER, value: 'b' },
        { type: TokenType.IF, value: 'if' },
        { type: TokenType.LPAREN, value: '(' },
        { type: TokenType.IDENTIFIER, value: 'x' },
        { type: TokenType.EQUALS, value: '==' },
        { type: TokenType.IDENTIFIER, value: 'y' },
        { type: TokenType.RPAREN, value: ')' },
        { type: TokenType.LBRACE, value: '{' },
        { type: TokenType.RBRACE, value: '}' },
        { type: TokenType.EOF, value: '' }
      ];

      verifyTokens(lexer, expectedTokens);
    });
  });

  describe('Line and Column Tracking', () => {
    test('tracks line numbers correctly', () => {
      const input = `let x = 5
let y = 10`;
      const lexer = new Lexer(input);
      
      // Premier let
      const firstLet = lexer.nextToken();
      expect(firstLet.line).toBe(1);
      expect(firstLet.type).toBe(TokenType.LET);

      // x
      const x = lexer.nextToken();
      expect(x.line).toBe(1);
      expect(x.type).toBe(TokenType.IDENTIFIER);

      // Consume jusqu'au deuxième let
      lexer.nextToken(); // =
      lexer.nextToken(); // 5

      // Deuxième let
      const secondLet = lexer.nextToken();
      expect(secondLet.line).toBe(2);
      expect(secondLet.type).toBe(TokenType.LET);
    });

    test('tracks column numbers correctly', () => {
      const input = 'let x = 5';
      const lexer = new Lexer(input);
      
      const let_token = lexer.nextToken();
      expect(let_token.column).toBe(0);
      
      const x_token = lexer.nextToken();
      expect(x_token.column).toBe(4);
    });
  });
});

function verifyTokens(lexer: Lexer, expectedTokens: Array<{type: TokenType, value: string}>) {
  expectedTokens.forEach((expected, i) => {
    const token = lexer.nextToken();
    expect(token.type).toBe(expected.type);
    expect(token.value).toBe(expected.value);
  });
}