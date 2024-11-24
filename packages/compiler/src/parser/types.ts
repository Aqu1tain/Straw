export interface Node {
    type: string;
    position: {
      line: number;
      column: number;
    };
  }
  
  // Expressions
  export interface Expression extends Node {}
  
  export interface Identifier extends Expression {
    type: 'Identifier';
    name: string;
  }
  
  export interface NumericLiteral extends Expression {
    type: 'NumericLiteral';
    value: number;
  }
  
  export interface StringLiteral extends Expression {
    type: 'StringLiteral';
    value: string;
  }
  
  export interface BinaryExpression extends Expression {
    type: 'BinaryExpression';
    operator: string;
    left: Expression;
    right: Expression;
  }
  
  export interface PrefixExpression extends Expression {
    type: 'PrefixExpression';
    operator: string;
    right: Expression;
  }
  
  // Statements
  export interface Statement extends Node {}
  
  export interface ExpressionStatement extends Statement {
    type: 'ExpressionStatement';
    expression: Expression;
  }
  
  export interface LetStatement extends Statement {
    type: 'LetStatement';
    name: Identifier;
    value: Expression;
  }
  
  export interface ReturnStatement extends Statement {
    type: 'ReturnStatement';
    value: Expression;
  }
  
  export interface BlockStatement extends Statement {
    type: 'BlockStatement';
    statements: Statement[];
  }
  
  // Function-related
  export interface FunctionParameter {
    name: Identifier;
    typeAnnotation?: TypeAnnotation;
  }
  
  export interface FunctionDeclaration extends Statement {
    type: 'FunctionDeclaration';
    name: Identifier;
    parameters: FunctionParameter[];
    returnType?: TypeAnnotation;
    body: BlockStatement;
  }
  
  // Types
  export interface TypeAnnotation extends Node {
    type: 'TypeAnnotation';
    name: string;
  }
  
  // Program root
  export interface Program extends Node {
    type: 'Program';
    statements: Statement[];
  }