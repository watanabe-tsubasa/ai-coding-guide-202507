export type Expr =
  | { kind: 'Var'; name: string }
  | { kind: 'Lambda'; param: string; body: Expr }
  | { kind: 'App'; func: Expr; arg: Expr }
  | { kind: 'Let'; name: string; value: Expr; body: Expr }
  | { kind: 'Lit'; value: number | boolean };

export const var_ = (name: string): Expr => ({ kind: 'Var', name });
export const lambda = (param: string, body: Expr): Expr => ({ kind: 'Lambda', param, body });
export const app = (func: Expr, arg: Expr): Expr => ({ kind: 'App', func, arg });
export const let_ = (name: string, value: Expr, body: Expr): Expr => ({ kind: 'Let', name, value, body });
export const lit = (value: number | boolean): Expr => ({ kind: 'Lit', value });

export function prettyPrint(expr: Expr): string {
  switch (expr.kind) {
    case 'Var':
      return expr.name;
    case 'Lambda':
      return `λ${expr.param}. ${prettyPrint(expr.body)}`;
    case 'App':
      return `(${prettyPrint(expr.func)} ${prettyPrint(expr.arg)})`;
    case 'Let':
      return `let ${expr.name} = ${prettyPrint(expr.value)} in ${prettyPrint(expr.body)}`;
    case 'Lit':
      return String(expr.value);
  }
}