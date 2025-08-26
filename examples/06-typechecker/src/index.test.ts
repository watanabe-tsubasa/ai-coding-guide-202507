// src/index.test.ts

import { describe, it, expect } from 'vitest';
import { EAbs, EVar, EApp, ELit } from './ast';
import { infer, TypeEnv, apply } from './typechecker';
import { typeToString, resetTypeId } from './types';

describe('Hindley-Milner Type Checker', () => {

    const runInfer = (expr) => {
        resetTypeId();
        const initialEnv = new TypeEnv();
        const [type, subst] = infer(initialEnv, expr);
        return typeToString(apply(subst, type));
    };

    it('should infer the type of the identity function as a -> a', () => {
        // x -> x
        const identityFn = EAbs('x', EVar('x'));
        const type = runInfer(identityFn);
        expect(type).toBe('a -> a');
    });

    it("should infer the type of the K combinator as a -> b -> a", () => {
        // x -> y -> x
        const kCombinator = EAbs('x', EAbs('y', EVar('x')));
        const type = runInfer(kCombinator);
        expect(type).toBe('a -> b -> a');
    });

    it('should throw a type error for an invalid application', () => {
        // (x -> x) true 42
        const invalidApp = EApp(
            EApp(EAbs('x', EVar('x')), ELit(true)),
            ELit(42)
        );
        
        const inferAction = () => runInfer(invalidApp);

        expect(inferAction).toThrowError(/Cannot unify Bool with Int ->/);
    });
});
