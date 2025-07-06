import type { Type } from './types.js';
import { applySubst, freeTypeVars, tArrow } from './types.js';

export type Substitution = Map<string, Type>;

export const emptySubst: Substitution = new Map();

export function composeSubst(s1: Substitution, s2: Substitution): Substitution {
  const result = new Map<string, Type>();
  
  for (const [k, v] of s2) {
    result.set(k, applySubst(s1, v));
  }
  
  for (const [k, v] of s1) {
    if (!result.has(k)) {
      result.set(k, v);
    }
  }
  
  return result;
}

export class UnificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnificationError';
  }
}

function occursCheck(name: string, type: Type): boolean {
  return freeTypeVars(type).has(name);
}

export function unify(t1: Type, t2: Type): Substitution {
  if (t1.kind === 'TVar' && t2.kind === 'TVar' && t1.name === t2.name) {
    return emptySubst;
  }
  
  if (t1.kind === 'TVar') {
    if (occursCheck(t1.name, t2)) {
      throw new UnificationError(`Occurs check failed: ${t1.name} in ${JSON.stringify(t2)}`);
    }
    return new Map([[t1.name, t2]]);
  }
  
  if (t2.kind === 'TVar') {
    if (occursCheck(t2.name, t1)) {
      throw new UnificationError(`Occurs check failed: ${t2.name} in ${JSON.stringify(t1)}`);
    }
    return new Map([[t2.name, t1]]);
  }
  
  if (t1.kind === 'TInt' && t2.kind === 'TInt') {
    return emptySubst;
  }
  
  if (t1.kind === 'TBool' && t2.kind === 'TBool') {
    return emptySubst;
  }
  
  if (t1.kind === 'TArrow' && t2.kind === 'TArrow') {
    const s1 = unify(t1.from, t2.from);
    const s2 = unify(applySubst(s1, t1.to), applySubst(s1, t2.to));
    return composeSubst(s2, s1);
  }
  
  throw new UnificationError(`Cannot unify ${JSON.stringify(t1)} with ${JSON.stringify(t2)}`);
}