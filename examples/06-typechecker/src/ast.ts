// src/ast.ts

// --- Expression Types ---

// A variable, like 'x'.
export type EVar = { tag: 'EVar'; name: string };
// A literal value, like an integer or a boolean.
export type ELit = { tag: 'ELit'; value: { tag: 'LInt', value: number } | { tag: 'LBool', value: boolean } };
// A function application, like 'f x'.
export type EApp = { tag: 'EApp'; fn: Expr; arg: Expr };
// A lambda abstraction, like '\x -> x'.
export type EAbs = { tag: 'EAbs'; param: string; body: Expr };
// A let binding, like 'let x = e1 in e2'.
export type ELet = { tag: 'ELet'; name: string; value: Expr; body: Expr };

// Union of all possible expression types.
export type Expr = EVar | ELit | EApp | EAbs | ELet;

// --- Expression Constructors ---
export const EVar = (name: string): EVar => ({ tag: 'EVar', name });
export const ELit = (value: number | boolean): ELit => ({
    tag: 'ELit',
    value: typeof value === 'number' ? { tag: 'LInt', value } : { tag: 'LBool', value },
});
export const EApp = (fn: Expr, arg: Expr): EApp => ({ tag: 'EApp', fn, arg });
export const EAbs = (param: string, body: Expr): EAbs => ({ tag: 'EAbs', param, body });
export const ELet = (name: string, value: Expr, body: Expr): ELet => ({ tag: 'ELet', name, value, body });
