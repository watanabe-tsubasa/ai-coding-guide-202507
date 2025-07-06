export type Type =
  | { kind: 'TVar'; name: string }
  | { kind: 'TInt' }
  | { kind: 'TBool' }
  | { kind: 'TArrow'; from: Type; to: Type };

export type TypeScheme = {
  vars: string[];
  type: Type;
};

export const tVar = (name: string): Type => ({ kind: 'TVar', name });
export const tInt: Type = { kind: 'TInt' };
export const tBool: Type = { kind: 'TBool' };
export const tArrow = (from: Type, to: Type): Type => ({ kind: 'TArrow', from, to });

export function prettyPrintType(type: Type): string {
  switch (type.kind) {
    case 'TVar':
      return type.name;
    case 'TInt':
      return 'Int';
    case 'TBool':
      return 'Bool';
    case 'TArrow':
      const fromStr = type.from.kind === 'TArrow' 
        ? `(${prettyPrintType(type.from)})`
        : prettyPrintType(type.from);
      return `${fromStr} -> ${prettyPrintType(type.to)}`;
  }
}

export function prettyPrintScheme(scheme: TypeScheme): string {
  if (scheme.vars.length === 0) {
    return prettyPrintType(scheme.type);
  }
  return `∀${scheme.vars.join(' ')}. ${prettyPrintType(scheme.type)}`;
}

export function freeTypeVars(type: Type): Set<string> {
  switch (type.kind) {
    case 'TVar':
      return new Set([type.name]);
    case 'TInt':
    case 'TBool':
      return new Set();
    case 'TArrow':
      return new Set([...freeTypeVars(type.from), ...freeTypeVars(type.to)]);
  }
}

export function applySubst(subst: Map<string, Type>, type: Type): Type {
  switch (type.kind) {
    case 'TVar':
      return subst.get(type.name) ?? type;
    case 'TInt':
    case 'TBool':
      return type;
    case 'TArrow':
      return tArrow(
        applySubst(subst, type.from),
        applySubst(subst, type.to)
      );
  }
}