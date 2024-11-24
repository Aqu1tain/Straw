import { Token, TokenType } from '../lexer/types';
import { Lexer } from '../lexer/lexer';
import { Precedence, getTokenPrecedence } from './precedence';
import * as AST from './types';

type PrefixParseFn = () => AST.Expression | null;
type InfixParseFn = (left: AST.Expression) => AST.Expression | null;


export class Parser {
  private lexer: Lexer;
  private currentToken: Token;
  private peekToken: Token;
  private errors: string[] = [];

  private prefixParseFns: Map<TokenType, PrefixParseFn>;
  private infixParseFns: Map<TokenType, InfixParseFn>;

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.nextToken();
    this.peekToken = this.lexer.nextToken();

    this.prefixParseFns = new Map();
    this.infixParseFns = new Map();

    // Prefix operators
    this.registerPrefix(TokenType.IDENTIFIER, this.parseIdentifier.bind(this));
    this.registerPrefix(TokenType.NUMBER, this.parseNumericLiteral.bind(this));
    this.registerPrefix(TokenType.STRING, this.parseStringLiteral.bind(this));
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression.bind(this));

    // Infix operators
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MULTIPLY, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.DIVIDE, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.EQUALS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.NOT_EQUALS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LESS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GREATER, this.parseInfixExpression.bind(this));
  }


  private registerPrefix(tokenType: TokenType, fn: PrefixParseFn) {
    this.prefixParseFns.set(tokenType, fn);
  }

  private registerInfix(tokenType: TokenType, fn: InfixParseFn) {
    this.infixParseFns.set(tokenType, fn);
  }

  private nextToken(): void {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  private expectPeek(tokenType: TokenType): boolean {
    if (this.peekToken.type === tokenType) {
      this.nextToken();
      return true;
    }
    
    this.errors.push(
      `Expected next token to be ${tokenType}, got ${this.peekToken.type} instead`
    );
    return false;
  }

  public parseProgram(): AST.Program {
    const program: AST.Program = {
      type: 'Program',
      statements: [],
      position: {
        line: this.currentToken.line,
        column: this.currentToken.column
      }
    };

    while (this.currentToken.type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }

    return program;
  }

  private parseStatement(): AST.Statement | null {
    switch (this.currentToken.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      case TokenType.FN:
        return this.parseFunctionDeclaration();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): AST.LetStatement | null {
    const position = {
      line: this.currentToken.line,
      column: this.currentToken.column
    };

    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      return null;
    }

    const name: AST.Identifier = {
      type: 'Identifier',
      name: this.currentToken.value,
      position: {
        line: this.currentToken.line,
        column: this.currentToken.column
      }
    };

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null;
    }

    this.nextToken();

    const value = this.parseExpression();
    if (!value) {
      return null;
    }

    return {
      type: 'LetStatement',
      name,
      value,
      position
    };
  }

  private parseReturnStatement(): AST.ReturnStatement | null {
    const position = {
      line: this.currentToken.line,
      column: this.currentToken.column
    };

    this.nextToken();

    const value = this.parseExpression();
    if (!value) {
      return null;
    }

    return {
      type: 'ReturnStatement',
      value,
      position
    };
  }

  private parseFunctionDeclaration(): AST.FunctionDeclaration | null {
    const position = {
      line: this.currentToken.line,
      column: this.currentToken.column
    };

    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      return null;
    }

    const name: AST.Identifier = {
      type: 'Identifier',
      name: this.currentToken.value,
      position: {
        line: this.currentToken.line,
        column: this.currentToken.column
      }
    };

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    const parameters = this.parseFunctionParameters();

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    const body = this.parseBlockStatement();
    if (!body) {
      return null;
    }

    return {
      type: 'FunctionDeclaration',
      name,
      parameters,
      body,
      position
    };
  }

  private parseFunctionParameters(): AST.FunctionParameter[] {
    const parameters: AST.FunctionParameter[] = [];

    if (this.peekToken.type === TokenType.RPAREN) {
      this.nextToken();
      return parameters;
    }

    this.nextToken();

    const firstParam = this.parseFunctionParameter();
    if (firstParam) {
      parameters.push(firstParam);
    }

    while (this.peekToken.type === TokenType.COMMA) {
      this.nextToken(); // consume comma
      this.nextToken();
      const param = this.parseFunctionParameter();
      if (param) {
        parameters.push(param);
      }
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return [];
    }

    return parameters;
  }

  private parseFunctionParameter(): AST.FunctionParameter | null {
    if (this.currentToken.type !== TokenType.IDENTIFIER) {
      return null;
    }

    const name: AST.Identifier = {
      type: 'Identifier',
      name: this.currentToken.value,
      position: {
        line: this.currentToken.line,
        column: this.currentToken.column
      }
    };

    let typeAnnotation: AST.TypeAnnotation | undefined;

    if (this.peekToken.type === TokenType.COLON) {
      this.nextToken(); // consume colon
      this.nextToken();
      typeAnnotation = {
        type: 'TypeAnnotation',
        name: this.currentToken.value,
        position: {
          line: this.currentToken.line,
          column: this.currentToken.column
        }
      };
    }

    return {
      name,
      typeAnnotation
    };
  }

  private parseBlockStatement(): AST.BlockStatement | null {
    const position = {
      line: this.currentToken.line,
      column: this.currentToken.column
    };

    const statements: AST.Statement[] = [];

    this.nextToken();

    while (
      this.currentToken.type !== TokenType.RBRACE &&
      this.currentToken.type !== TokenType.EOF
    ) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
      this.nextToken();
    }

    return {
      type: 'BlockStatement',
      statements,
      position
    };
  }

  private parseExpressionStatement(): AST.ExpressionStatement | null {
    const expression = this.parseExpression(Precedence.LOWEST);
    if (!expression) {
      return null;
    }

    return {
      type: 'ExpressionStatement',
      expression,
      position: {
        line: this.currentToken.line,
        column: this.currentToken.column
      }
    };
  }

  private parseExpression(precedence: Precedence = Precedence.LOWEST): AST.Expression | null {
    const prefixFn = this.prefixParseFns.get(this.currentToken.type);
    if (!prefixFn) {
      this.errors.push(`No prefix parse function for ${this.currentToken.type} found`);
      return null;
    }

    let leftExp = prefixFn();
    if (!leftExp) {
      return null;
    }

    while (
      this.peekToken.type !== TokenType.EOF &&
      precedence < this.peekPrecedence()
    ) {
      const infixFn = this.infixParseFns.get(this.peekToken.type);
      if (!infixFn) {
        return leftExp;
      }

      this.nextToken();
      const rightExp: AST.Expression | null = infixFn(leftExp);
      if (!rightExp) {
        return leftExp;
      }
      leftExp = rightExp;
    }

    return leftExp;
  }

  private parsePrefixExpression(): AST.PrefixExpression | null {
    const position = {
      line: this.currentToken.line,
      column: this.currentToken.column
    };

    const operator = this.currentToken.value;
    this.nextToken();

    const right = this.parseExpression(Precedence.PREFIX);
    if (!right) {
      return null;
    }

    return {
      type: 'PrefixExpression',
      operator,
      right,
      position
    };
  }

  private parseInfixExpression(left: AST.Expression): AST.BinaryExpression {
    const position = {
      line: this.currentToken.line,
      column: this.currentToken.column
    };

    // Map les opérateurs pour l'affichage
    const operatorMap: { [key: string]: string } = {
      [TokenType.EQUALS]: '==',
      [TokenType.NOT_EQUALS]: '!=',
      [TokenType.LESS]: '<',
      [TokenType.GREATER]: '>',
      [TokenType.PLUS]: '+',
      [TokenType.MINUS]: '-',
      [TokenType.MULTIPLY]: '*',
      [TokenType.DIVIDE]: '/'
    };

    const operator = operatorMap[this.currentToken.type] || this.currentToken.value;
    const precedence = this.curPrecedence();
    this.nextToken();

    const right = this.parseExpression(precedence);
    if (!right) {
      throw new Error('Failed to parse right side of infix expression');
    }
    
    return {
      type: 'BinaryExpression',
      operator,
      left,
      right,
      position
    };
  }

  private parseGroupedExpression(): AST.Expression | null {
    this.nextToken();

    const exp = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    return exp;
  }

  private peekPrecedence(): Precedence {
    return getTokenPrecedence(this.peekToken.type);
  }

  private curPrecedence(): Precedence {
    return getTokenPrecedence(this.currentToken.type);
  }

  private parseIdentifier(): AST.Identifier {
    return {
      type: 'Identifier',
      name: this.currentToken.value,
      position: {
        line: this.currentToken.line,
        column: this.currentToken.column
      }
    };
  }

  private parseNumericLiteral(): AST.NumericLiteral {
    return {
      type: 'NumericLiteral',
      value: parseFloat(this.currentToken.value),
      position: {
        line: this.currentToken.line,
        column: this.currentToken.column
      }
    };
  }

  private parseStringLiteral(): AST.StringLiteral {
    return {
      type: 'StringLiteral',
      value: this.currentToken.value,
      position: {
        line: this.currentToken.line,
        column: this.currentToken.column
      }
    };
  }

  public getErrors(): string[] {
    return this.errors;
  }
}