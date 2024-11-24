import { Lexer } from '../lexer';
import { Parser } from '../../parser/parser';
import { WasmGenerator } from '../../generator/wasm-generator';

async function compileAndRun(input: string): Promise<number> {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  
  const generator = new WasmGenerator();
  const binary = generator.generate(program);

  const module = await WebAssembly.compile(binary);
  const instance = await WebAssembly.instantiate(module);
  
  return (instance.exports.main as CallableFunction)();
}

describe('WebAssembly Generator', () => {
  describe('Basic Expressions', () => {
    test('generates correct code for numeric literals', async () => {
      expect(await compileAndRun('42')).toBe(42);
      expect(await compileAndRun('123')).toBe(123);
      expect(await compileAndRun('0')).toBe(0);
    });

    test('generates correct code for basic arithmetic', async () => {
      expect(await compileAndRun('2 + 3')).toBe(5);
      expect(await compileAndRun('10 - 5')).toBe(5);
      expect(await compileAndRun('4 * 3')).toBe(12);
      expect(await compileAndRun('15 / 3')).toBe(5);
    });

    test('handles operator precedence correctly', async () => {
      expect(await compileAndRun('2 + 3 * 4')).toBe(14);
      expect(await compileAndRun('(2 + 3) * 4')).toBe(20);
      expect(await compileAndRun('10 - 5 - 3')).toBe(2);
    });
  });

  describe('Variables', () => {
    test('handles let statements', async () => {
      expect(await compileAndRun('let x = 42\nx')).toBe(42);
    });

    test('handles multiple variables', async () => {
      const input = `
        let x = 10
        let y = 20
        x + y
      `;
      expect(await compileAndRun(input)).toBe(30);
    });

    test('handles variable reassignment', async () => {
      const input = `
        let x = 10
        let y = x + 5
        y
      `;
      expect(await compileAndRun(input)).toBe(15);
    });
  });

  describe('Complex Expressions', () => {
    test('handles complex arithmetic expressions', async () => {
      const input = `
        let x = 10
        let y = 20
        let z = 5
        x + y * z
      `;
      expect(await compileAndRun(input)).toBe(110);
    });

    test('handles nested expressions', async () => {
      const input = `
        let a = 5
        let b = 3
        let c = 2
        (a + b) * (c + 1)
      `;
      expect(await compileAndRun(input)).toBe(24);
    });

    test('handles division by non-zero', async () => {
      expect(await compileAndRun('10 / 2')).toBe(5);
      expect(await compileAndRun('15 / 3')).toBe(5);
      expect(await compileAndRun('100 / 10')).toBe(10);
    });
  });

  describe('Error Cases', () => {
    test('handles undefined variables', async () => {
      await expect(compileAndRun('x')).rejects.toThrow();
    });

    test('handles division by zero', async () => {
      // WebAssembly division by zero traps
      await expect(compileAndRun('10 / 0')).rejects.toThrow();
    });
  });

  describe('WebAssembly Module Structure', () => {
    test('generates valid module header', () => {
      const lexer = new Lexer('42');
      const parser = new Parser(lexer);
      const generator = new WasmGenerator();
      const binary = generator.generate(parser.parseProgram());

      // Vérifie le magic number et la version
      expect(binary[0]).toBe(0x00);
      expect(binary[1]).toBe(0x61);
      expect(binary[2]).toBe(0x73);
      expect(binary[3]).toBe(0x6d);
      expect(binary[4]).toBe(0x01);
      expect(binary[5]).toBe(0x00);
      expect(binary[6]).toBe(0x00);
      expect(binary[7]).toBe(0x00);
    });

    test('exports main function', async () => {
      const lexer = new Lexer('42');
      const parser = new Parser(lexer);
      const generator = new WasmGenerator();
      const binary = generator.generate(parser.parseProgram());

      const module = await WebAssembly.compile(binary);
      const instance = await WebAssembly.instantiate(module);

      expect(instance.exports.main).toBeDefined();
      expect(typeof instance.exports.main).toBe('function');
    });
  });

  describe('Performance', () => {
    test('handles large numbers of operations', async () => {
      const operations = Array(100).fill('1').join(' + ');
      const result = await compileAndRun(operations);
      expect(result).toBe(100);
    });

    test('handles deeply nested expressions', async () => {
      // Crée une expression profondément imbriquée
      let expr = '1';
      for (let i = 0; i < 10; i++) {
        expr = `(${expr} + 1)`;
      }
      const result = await compileAndRun(expr);
      expect(result).toBe(11);
    });
  });
});