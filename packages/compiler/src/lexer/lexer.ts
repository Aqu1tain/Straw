// packages/compiler/src/lexer/lexer.ts

import { Token, TokenType, Position } from './types';

export class Lexer {
  private source: string;
  private position: number = 0;
  private readPosition: number = 0;
  private currentChar: string = '';
  private line: number = 1;
  private column: number = -1; // Set to 0 on first read

  private keywords: Map<string, TokenType> = new Map([
    ['fn', TokenType.FN],
    ['let', TokenType.LET],
    ['const', TokenType.CONST],
    ['if', TokenType.IF],
    ['else', TokenType.ELSE],
    ['return', TokenType.RETURN],
    ['while', TokenType.WHILE],
    ['for', TokenType.FOR],
    ['in', TokenType.IN],
    ['component', TokenType.COMPONENT],
    ['props', TokenType.PROPS],
    ['state', TokenType.STATE],
    ['render', TokenType.RENDER],
    ['async', TokenType.ASYNC],
    ['await', TokenType.AWAIT],
    ['try', TokenType.TRY],
    ['catch', TokenType.CATCH],
  ]);

  constructor(source: string) {
    this.source = source;
    this.readChar();
  }

  public nextToken(): Token {
    this.skipWhitespace();

    const position: Position = {
      line: this.line,
      column: this.column,
    };

    let token: Token;

    switch (this.currentChar) {
      case '=':
        if (this.peekChar() === '=') {
          const ch = this.currentChar;
          this.readChar();
          token = this.createToken(TokenType.EQUALS, ch + this.currentChar, position);
          this.readChar(); // Consommer le deuxième =
        } else if (this.peekChar() === '>') {
          this.readChar();
          token = this.createToken(TokenType.ARROW, '=>', position);
          this.readChar(); // Consommer le >
        } else {
          token = this.createToken(TokenType.ASSIGN, this.currentChar, position);
          this.readChar();
        }
        return token;
      case '<':
        token = this.createToken(TokenType.LESS, this.currentChar, position);
        this.readChar();
        return token;
      case '>':
        token = this.createToken(TokenType.GREATER, this.currentChar, position);
        this.readChar();
        return token;
      case '+': token = this.createToken(TokenType.PLUS, this.currentChar, position); break;
      case '-': token = this.createToken(TokenType.MINUS, this.currentChar, position); break;
      case '*': token = this.createToken(TokenType.MULTIPLY, this.currentChar, position); break;
      case '/': token = this.createToken(TokenType.DIVIDE, this.currentChar, position); break;
      case '(': token = this.createToken(TokenType.LPAREN, this.currentChar, position); break;
      case ')': token = this.createToken(TokenType.RPAREN, this.currentChar, position); break;
      case '{': token = this.createToken(TokenType.LBRACE, this.currentChar, position); break;
      case '}': token = this.createToken(TokenType.RBRACE, this.currentChar, position); break;
      case '[': token = this.createToken(TokenType.LBRACKET, this.currentChar, position); break;
      case ']': token = this.createToken(TokenType.RBRACKET, this.currentChar, position); break;
      case ',': token = this.createToken(TokenType.COMMA, this.currentChar, position); break;
      case '.': token = this.createToken(TokenType.DOT, this.currentChar, position); break;
      case ':': token = this.createToken(TokenType.COLON, this.currentChar, position); break;
      case ';': token = this.createToken(TokenType.SEMICOLON, this.currentChar, position); break;
      case '': token = this.createToken(TokenType.EOF, '', position); break;

      default:
        if (this.isLetter(this.currentChar)) {
          const identifier = this.readIdentifier();
          const type = this.keywords.get(identifier) || TokenType.IDENTIFIER;
          return this.createToken(type, identifier, position);
        } else if (this.isDigit(this.currentChar)) {
          return this.createToken(TokenType.NUMBER, this.readNumber(), position);
        } else if (this.currentChar === '"' || this.currentChar === "'") {
          return this.readString(position);
        } else {
          token = this.createToken(TokenType.ILLEGAL, this.currentChar, position);
        }
    }

    this.readChar();
    return token;
  }

  private readChar(): void {
    if (this.currentChar === '\n') {
      this.line++;
      this.column = -1; // Set to 0 on first read
    }

    this.currentChar = this.readPosition >= this.source.length 
      ? '' 
      : this.source[this.readPosition];
    
    this.position = this.readPosition;
    this.readPosition++;
    this.column++;
  }

  private peekChar(): string {
    return this.readPosition >= this.source.length 
      ? '' 
      : this.source[this.readPosition];
  }

  private readIdentifier(): string {
    const startPosition = this.position;
    while (this.isLetter(this.currentChar) || this.isDigit(this.currentChar)) {
      this.readChar();
    }
    return this.source.slice(startPosition, this.position);
  }

  private readNumber(): string {
    const startPosition = this.position;
    let hasDot = false;

    while (this.isDigit(this.currentChar) || (!hasDot && this.currentChar === '.')) {
      if (this.currentChar === '.') hasDot = true;
      this.readChar();
    }

    return this.source.slice(startPosition, this.position);
  }

  private readString(position: Position): Token {
    const quote = this.currentChar;
    this.readChar(); // Skip opening quote
    const startPosition = this.position;

    while (this.currentChar !== quote && this.currentChar !== '') {
      this.readChar();
    }

    const value = this.source.slice(startPosition, this.position);
    this.readChar(); // Skip closing quote
    
    return this.createToken(TokenType.STRING, value, position);
  }

  private createToken(type: TokenType, value: string, position: Position): Token {
    return {
      type,
      value,
      line: position.line,
      column: position.column,
    };
  }

  private skipWhitespace(): void {
    while (
      this.currentChar === ' ' || 
      this.currentChar === '\t' || 
      this.currentChar === '\n' || 
      this.currentChar === '\r'
    ) {
      this.readChar();
    }
  }

  private isLetter(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }
}