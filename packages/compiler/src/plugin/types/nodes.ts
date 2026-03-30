/**
 * Schema IR node types produced by static analysis of Valibot schema
 * construction calls.
 */

export interface ObjectSchemaNode {
  readonly kind: 'schema';
  readonly type: 'object';
  readonly entries: Record<string, SchemaNode>;
  readonly message?: string | undefined;
}

export interface StringSchemaNode {
  readonly kind: 'schema';
  readonly type: 'string';
  readonly message?: string | undefined;
}

export interface PipeNode {
  readonly kind: 'pipe';
  readonly schema: SchemaNode;
  readonly actions: readonly ActionNode[];
}

export type SchemaNode = ObjectSchemaNode | StringSchemaNode | PipeNode;

export interface EmailActionNode {
  readonly kind: 'action';
  readonly type: 'email';
  readonly message?: string | undefined;
}

export interface MinLengthActionNode {
  readonly kind: 'action';
  readonly type: 'minLength';
  readonly requirement: number;
  readonly message?: string | undefined;
}

export type ActionNode = EmailActionNode | MinLengthActionNode;
