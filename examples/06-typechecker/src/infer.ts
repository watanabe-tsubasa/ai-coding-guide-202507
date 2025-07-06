import type { Expr } from './ast.js';
import type { Type, TypeScheme } from './types.js';
import { tVar, tInt, tBool, tArrow, freeTypeVars, applySubst } from './types.js';
import { TypeEnv } from './environment.js';
import { unify, composeSubst, emptySubst, type Substitution } from './unification.js';

let typeVarCounter = 0;

function freshTypeVar(): Type {
  return tVar(`t${typeVarCounter++}`);
}

export function resetTypeVarCounter(): void {
  typeVarCounter = 0;
}

function instantiate(scheme: TypeScheme): Type {
  const subst = new Map<string, Type>();
  for (const v of scheme.vars) {
    subst.set(v, freshTypeVar());
  }
  return applySubst(subst, scheme.type);
}

function generalize(env: TypeEnv, type: Type): TypeScheme {
  const typeVars = freeTypeVars(type);
  const envVars = env.freeTypeVars();
  const generalizable = [...typeVars].filter(v => !envVars.has(v));
  return {
    vars: generalizable,
    type
  };
}

export class InferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InferenceError';
  }
}

function inferType(env: TypeEnv, expr: Expr): [Substitution, Type] {
  switch (expr.kind) {
    case 'Var': {
      const scheme = env.lookup(expr.name);
      if (!scheme) {
        throw new InferenceError(`Unbound variable: ${expr.name}`);
      }
      return [emptySubst, instantiate(scheme)];
    }
    
    case 'Lambda': {
      const paramType = freshTypeVar();
      const newEnv = env.extend(expr.param, { vars: [], type: paramType });
      const [bodySubst, bodyType] = inferType(newEnv, expr.body);
      const inferredParamType = applySubst(bodySubst, paramType);
      return [bodySubst, tArrow(inferredParamType, bodyType)];
    }
    
    case 'App': {
      const [funcSubst, funcType] = inferType(env, expr.func);
      const [argSubst, argType] = inferType(applySubstToEnv(funcSubst, env), expr.arg);
      const resultType = freshTypeVar();
      const expectedFuncType = tArrow(argType, resultType);
      const unifySubst = unify(applySubst(argSubst, funcType), expectedFuncType);
      const finalSubst = composeSubst(unifySubst, composeSubst(argSubst, funcSubst));
      return [finalSubst, applySubst(unifySubst, resultType)];
    }
    
    case 'Let': {
      const [valueSubst, valueType] = inferType(env, expr.value);
      const newEnv = applySubstToEnv(valueSubst, env);
      const scheme = generalize(newEnv, valueType);
      const extendedEnv = newEnv.extend(expr.name, scheme);
      const [bodySubst, bodyType] = inferType(extendedEnv, expr.body);
      return [composeSubst(bodySubst, valueSubst), bodyType];
    }
    
    case 'Lit': {
      const litType = typeof expr.value === 'number' ? tInt : tBool;
      return [emptySubst, litType];
    }
  }
}

function applySubstToEnv(subst: Substitution, env: TypeEnv): TypeEnv {
  // This is a simplification - in a real implementation, 
  // we'd need to apply substitution to all type schemes in the environment
  return env;
}

export function infer(expr: Expr, env: TypeEnv = new TypeEnv()): Type {
  resetTypeVarCounter();
  const [subst, type] = inferType(env, expr);
  return applySubst(subst, type);
}