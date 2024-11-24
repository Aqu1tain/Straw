import { Lexer } from '../lexer';
import { Parser } from '../../parser/parser';
import { TokenType } from '../types';
import * as AST from '../../parser/types';

describe('Parser', () => {
  describe('Basic Parsing', () => {
    test('parses let statements', () => {
      const input = `let x = 5`;
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      
      const program = parser.parseProgram();
      expect(parser.getErrors()).toEqual([]);
      expect(program.statements.length).toBe(1);
      
      const stmt = program.statements[0] as AST.LetStatement;
      expect(stmt.type).toBe('LetStatement');
      expect(stmt.name.name).toBe('x');
      expect((stmt.value as AST.NumericLiteral).value).toBe(5);
    });
  });

  describe('Expression Parsing', () => {
    test('parses numeric operations', () => {
      const tests = [
        {
          input: '5 + 3',
          expected: '(5 + 3)'
        },
        {
          input: '5 - 3',
          expected: '(5 - 3)'
        },
        {
          input: '5 * 3',
          expected: '(5 * 3)'
        },
        {
          input: '5 / 3',
          expected: '(5 / 3)'
        }
      ];

      tests.forEach(({ input, expected }) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        expect(parser.getErrors()).toEqual([]);
        expect(program.statements.length).toBe(1);
        expect(stringifyAST(program.statements[0])).toBe(expected);
      });
    });

    test('parses prefix operators', () => {
      const input = '-5';
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(parser.getErrors()).toEqual([]);
      const stmt = program.statements[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.PrefixExpression;
      expect(expr.type).toBe('PrefixExpression');
      expect(expr.operator).toBe('-');
      expect((expr.right as AST.NumericLiteral).value).toBe(5);
    });

    test('parses comparisons', () => {
      const tests = [
        {
          input: 'a == b',
          expected: '(a == b)'
        },
        {
          input: 'a < b',
          expected: '(a < b)'
        },
        {
          input: 'a > b',
          expected: '(a > b)'
        }
      ];

      tests.forEach(({ input, expected }) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        expect(parser.getErrors()).toEqual([]);
        expect(stringifyAST(program.statements[0])).toBe(expected);
      });
    });
    test('parses comparisons', () => {
      const tests = [
        {
          input: 'a == b',
          expected: '(a == b)'
        },
        {
          input: 'a < b',
          expected: '(a < b)'
        },
        {
          input: 'a > b',
          expected: '(a > b)'
        }
      ];
  
      tests.forEach(({ input, expected }) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        
        // Ajout de débogage
        let token = lexer.nextToken();
        console.log('Tokens:');
        while (token.type !== TokenType.EOF) {
          console.log(token);
          token = lexer.nextToken();
        }
        
        // Reset lexer
        const newLexer = new Lexer(input);
        const parser2 = new Parser(newLexer);
        const program = parser2.parseProgram();
  
        if (parser2.getErrors().length > 0) {
          console.log('Parser errors:', parser2.getErrors());
        }
  
        expect(parser2.getErrors()).toEqual([]);
        expect(stringifyAST(program.statements[0])).toBe(expected);
      });
    });  
  });
});

// Fonction utilitaire pour convertir l'AST en string
function stringifyAST(node: any): string {
  if (!node) return '';
  
  switch (node.type) {
    case 'ExpressionStatement':
      return stringifyAST(node.expression);
    case 'BinaryExpression':
      return `(${stringifyAST(node.left)} ${node.operator} ${stringifyAST(node.right)})`;
    case 'NumericLiteral':
      return node.value.toString();
    case 'Identifier':
      return node.name;
    case 'PrefixExpression':
      return `(${node.operator}${stringifyAST(node.right)})`;
    default:
      return 'Unknown';
  }
}