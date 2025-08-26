// src/typechecker.ts

import { Type, TVar, TCon, TApp, Scheme, tInt, tBool, freshVar, fn, typeToString } from "./types";
import { Expr } from "./ast";

// A substitution is a mapping from type variable IDs to types.
type Substitution = Map<number, Type>;

// The type environment maps variable names to their polymorphic types (schemes).
export class TypeEnv {
    public env: Map<string, Scheme>;

    constructor(env: Map<string, Scheme> = new Map()) {
        this.env = env;
    }

    get(name: string): Scheme | null {
        return this.env.get(name) ?? null;
    }

    extend(name: string, scheme: Scheme): TypeEnv {
        const newEnv = new Map(this.env);
        newEnv.set(name, scheme);
        return new TypeEnv(newEnv);
    }
}

// Applies a substitution to a type.
export const apply = (subst: Substitution, type: Type): Type => {
    switch (type.tag) {
        case 'TVar':
            const replacement = subst.get(type.id);
            return replacement ? apply(subst, replacement) : type;
        case 'TCon':
            return type;
        case 'TApp':
            return TApp(apply(subst, type.constructor), type.args.map(t => apply(subst, t)));
    }
};

// Applies a substitution to a type scheme.
const applyToScheme = (subst: Substitution, scheme: Scheme): Scheme => {
    const newSubst = new Map(subst);
    for (const id of scheme.variables) {
        newSubst.delete(id);
    }
    const newType = apply(newSubst, scheme.type);
    return Scheme(scheme.variables, newType);
};

// Applies a substitution to a whole environment.
const applyToEnv = (subst: Substitution, env: TypeEnv): TypeEnv => {
    const newEnv = new Map<string, Scheme>();
    for (const [name, scheme] of env.env.entries()) {
        newEnv.set(name, applyToScheme(subst, scheme));
    }
    return new TypeEnv(newEnv);
};

// Composes two substitutions. s1 is applied first, then s2.
const compose = (s2: Substitution, s1: Substitution): Substitution => {
    const result = new Map(s1);
    for (const [id, type] of s2.entries()) {
        result.set(id, apply(s1, type));
    }
    return result;
};

// Finds all free type variables in a type.
const ftv = (type: Type): Set<number> => {
    switch (type.tag) {
        case 'TVar':
            return new Set([type.id]);
        case 'TCon':
            return new Set();
        case 'TApp':
            return new Set([...type.args.flatMap(t => [...ftv(t)])]);
    }
};

// Finds free type variables in a scheme.
const ftvScheme = (scheme: Scheme): Set<number> => {
    const schemeFtv = ftv(scheme.type);
    for (const id of scheme.variables) {
        schemeFtv.delete(id);
    }
    return schemeFtv;
};

// Generalizes a type into a type scheme by quantifying over free variables.
const generalize = (env: TypeEnv, type: Type): Scheme => {
    const envFtv = new Set<number>();
    for (const scheme of env.env.values()) {
        for (const id of ftvScheme(scheme)) {
            envFtv.add(id);
        }
    }
    const typeFtv = ftv(type);
    const quantifiedVars = [...typeFtv].filter(id => !envFtv.has(id));
    return Scheme(quantifiedVars, type);
};

// Instantiates a type scheme by replacing quantified variables with fresh ones.
const instantiate = (scheme: Scheme): Type => {
    const subst: Substitution = new Map();
    for (const id of scheme.variables) {
        subst.set(id, freshVar());
    }
    return apply(subst, scheme.type);
};

// The unification algorithm.
const unify = (t1: Type, t2: Type): Substitution => {
    if (t1.tag === 'TVar') return varBind(t1.id, t2);
    if (t2.tag === 'TVar') return varBind(t2.id, t1);
    if (t1.tag === 'TCon' && t2.tag === 'TCon' && t1.name === t2.name) {
        return new Map();
    }
    if (t1.tag === 'TApp' && t2.tag === 'TApp') {
        if (t1.args.length !== t2.args.length) {
             throw new Error(`Cannot unify ${typeToString(t1)} with ${typeToString(t2)}: different number of args`);
        }
        let currentSubst = unify(t1.constructor, t2.constructor);
        for (let i = 0; i < t1.args.length; i++) {
            const s_next = unify(apply(currentSubst, t1.args[i]), apply(currentSubst, t2.args[i]));
            currentSubst = compose(s_next, currentSubst);
        }
        return currentSubst;
    }
    throw new Error(`Cannot unify ${typeToString(t1)} with ${typeToString(t2)}`);
};

const varBind = (id: number, type: Type): Substitution => {
    if (type.tag === 'TVar' && type.id === id) return new Map();
    if (ftv(type).has(id)) {
        throw new Error(`Occurs check failed: ${varName(id)} in ${typeToString(type)}`);
    }
    return new Map([[id, type]]);
};

const varName = (id: number): string => String.fromCharCode(97 + (id % 26));


// The main inference function.
export const infer = (env: TypeEnv, expr: Expr): [Type, Substitution] => {
    switch (expr.tag) {
        case 'ELit':
            if (expr.value.tag === 'LInt') {
                return [tInt, new Map()];
            }
            return [tBool, new Map()];
        case 'EVar': {
            const scheme = env.get(expr.name);
            if (!scheme) throw new Error(`Unbound variable: ${expr.name}`);
            return [instantiate(scheme), new Map()];
        }
        case 'EAbs': {
            const tv = freshVar();
            const newEnv = env.extend(expr.param, Scheme([], tv));
            const [tBody, s1] = infer(newEnv, expr.body);
            const tParam = apply(s1, tv);
            return [fn(tParam, tBody), s1];
        }
        case 'EApp': {
            const [tFn, s1] = infer(env, expr.fn);
            const env_s1 = applyToEnv(s1, env);
            const [tArg, s2] = infer(env_s1, expr.arg);
            const tFn_s2 = apply(s2, tFn);
            const tv = freshVar();
            const s3 = unify(tFn_s2, fn(tArg, tv));
            const finalType = apply(s3, tv);
            const finalSubst = compose(s3, compose(s2, s1));
            return [finalType, finalSubst];
        }
        case 'ELet': {
            const [tVal, s1] = infer(env, expr.value);
            const env_s1 = applyToEnv(s1, env);
            const scheme = generalize(env_s1, tVal);
            const newEnv = env_s1.extend(expr.name, scheme);
            const [tBody, s2] = infer(newEnv, expr.body);
            return [tBody, compose(s2, s1)];
        }
    }
};