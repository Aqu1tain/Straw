import * as AST from '../parser/types';

export class WasmGenerator {
  private locals: Map<string, number>;
  private localCount: number;
  private buffer: number[];
  private functionBody: number[];
  private typeSection: number[];
  private functionSection: number[];
  private codeSection: number[];

  constructor() {
    this.locals = new Map();
    this.localCount = 0;
    this.buffer = [];
    this.functionBody = [];
    this.typeSection = [];
    this.functionSection = [];
    this.codeSection = [];
  }

  generate(program: AST.Program): Uint8Array {
    // Réinitialise les buffers
    this.buffer = [];
    this.functionBody = [];
    
    // Génère le corps de la fonction principale
    for (const statement of program.statements) {
      this.generateStatement(statement);
    }
    
    // Ajoute une valeur de retour par défaut si nécessaire
    if (this.functionBody.length === 0) {
      this.emit(0x41, 0x00); // i32.const 0
    }

    // Construit le module complet
    this.generateModule();

    return new Uint8Array(this.buffer);
  }

  private generateModule() {
    // Header
    this.emit(0x00, 0x61, 0x73, 0x6d); // Magic number (\0asm)
    this.emit(0x01, 0x00, 0x00, 0x00); // Version 1

    // Type section
    this.generateTypeSection();
    
    // Function section
    this.generateFunctionSection();
    
    // Export section
    this.generateExportSection();
    
    // Code section
    this.generateCodeSection();
  }

  private generateTypeSection() {
    const section = [];
    section.push(0x01); // Nombre de types
    
    // Type de la fonction principale : () -> i32
    section.push(0x60); // func
    section.push(0x00); // 0 paramètres
    section.push(0x01); // 1 résultat
    section.push(0x7f); // i32 (signé)

    this.emitSection(0x01, section); // Type section
  }

  private generateFunctionSection() {
    const section = [];
    section.push(0x01); // Nombre de fonctions
    section.push(0x00); // Index du type de la fonction principale

    this.emitSection(0x03, section); // Function section
  }

  private generateExportSection() {
    const section = [];
    
    section.push(0x01); // Nombre d'exports
    
    // Export "main" -> func 0
    section.push(0x04); // Longueur du nom "main"
    section.push(0x6d, 0x61, 0x69, 0x6e); // "main" en UTF-8
    section.push(0x00); // Export type (function)
    section.push(0x00); // Function index

    this.emitSection(0x07, section); // Export section
  }

  private generateCodeSection() {
    const section = [];
    
    // Ajoute l'instruction de fin de fonction
    this.functionBody.push(0x0b); // end

    section.push(0x01); // Nombre de fonctions
    
    // Function body
    const funcBody = [];
    // Locals
    const numLocalTypes = this.localCount > 0 ? 1 : 0;
    funcBody.push(numLocalTypes); // Nombre de types de variables locales
    if (this.localCount > 0) {
      funcBody.push(this.localCount); // Nombre de variables de ce type
      funcBody.push(0x7f); // i32
    }
    
    // Instructions
    funcBody.push(...this.functionBody);
    
    // Encode la taille du corps de la fonction
    this.emitVecLen(section, funcBody.length);
    section.push(...funcBody);

    this.emitSection(0x0a, section); // Code section
  }

  private generateStatement(statement: AST.Statement) {
    if (this.isLetStatement(statement)) {
      this.generateLetStatement(statement);
    } else if (this.isExpressionStatement(statement)) {
      this.generateExpression(statement.expression);
    } else {
      throw new Error(`Unsupported statement type: ${statement.type}`);
    }
  }

  private generateLetStatement(statement: AST.LetStatement) {
    const index = this.getOrCreateLocal(statement.name.name);
    this.generateExpression(statement.value);
    this.functionBody.push(0x21); // local.set
    this.emitU32ToVec(this.functionBody, index);
  }

  private generateExpression(expression: AST.Expression) {
    if (this.isNumericLiteral(expression)) {
      // Assurons-nous que le nombre est traité comme un i32 signé
      const value = expression.value;
      this.functionBody.push(0x41); // i32.const
      this.emitI32ToVec(this.functionBody, value);
    } else if (this.isIdentifier(expression)) {
      const index = this.getLocal(expression.name);
      this.functionBody.push(0x20); // local.get
      this.emitU32ToVec(this.functionBody, index);
    } else if (this.isBinaryExpression(expression)) {
      this.generateBinaryExpression(expression);
    }
  }

  private emitI32ToVec(vec: number[], value: number) {
    // Traite le nombre comme un i32 signé
    const i32Value = value | 0; // Force la conversion en i32
    let byte: number;
    let more = true;

    while (more) {
      byte = i32Value & 0x7f;
      // Déplace de 7 bits vers la droite avec signe
      value = i32Value >> 7;
      // Continue si la valeur n'est pas égale au signe étendu à tous les bits
      more = !((value === 0 && (byte & 0x40) === 0) ||
               (value === -1 && (byte & 0x40) !== 0));
      if (more) {
        byte |= 0x80; // Marque qu'il y a plus d'octets
      }
      vec.length++; // Fix pour éviter RangeError: Invalid array length
      vec[vec.length - 1] = byte;
    }
  }


  private generateBinaryExpression(expression: AST.BinaryExpression) {
    this.generateExpression(expression.left);
    this.generateExpression(expression.right);
    
    switch (expression.operator) {
      case '+':
        this.functionBody.push(0x6a); // i32.add
        break;
      case '-':
        this.functionBody.push(0x6b); // i32.sub
        break;
      case '*':
        this.functionBody.push(0x6c); // i32.mul
        break;
      case '/':
        this.functionBody.push(0x6d); // i32.div_s (division signée)
        break;
      default:
        throw new Error(`Unsupported operator: ${expression.operator}`);
    }
  }

  // Type guards
  private isLetStatement(node: AST.Statement): node is AST.LetStatement {
    return node.type === 'LetStatement';
  }

  private isExpressionStatement(node: AST.Statement): node is AST.ExpressionStatement {
    return node.type === 'ExpressionStatement';
  }

  private isNumericLiteral(node: AST.Expression): node is AST.NumericLiteral {
    return node.type === 'NumericLiteral';
  }

  private isIdentifier(node: AST.Expression): node is AST.Identifier {
    return node.type === 'Identifier';
  }

  private isBinaryExpression(node: AST.Expression): node is AST.BinaryExpression {
    return node.type === 'BinaryExpression';
  }

  // Utilitaires d'émission
  private emit(...bytes: number[]) {
    this.buffer.push(...bytes);
  }

  private emitSection(id: number, content: number[]) {
    this.emit(id);
    this.emitVecLen(this.buffer, content.length);
    this.emit(...content);
  }

  private emitVecLen(vec: number[], len: number) {
    this.emitU32ToVec(vec, len);
  }

  private emitU32ToVec(vec: number[], value: number) {
    do {
      let byte = value & 0x7f;
      value >>>= 7;
      if (value !== 0) {
        byte |= 0x80;
      }
      vec.push(byte);
    } while (value !== 0);
  }

  private getOrCreateLocal(name: string): number {
    let index = this.locals.get(name);
    if (index === undefined) {
      index = this.localCount++;
      this.locals.set(name, index);
    }
    return index;
  }

  private getLocal(name: string): number {
    const index = this.locals.get(name);
    if (index === undefined) {
      throw new Error(`Undefined variable: ${name}`);
    }
    return index;
  }
}