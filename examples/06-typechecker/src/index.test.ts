import { describe, it, expect } from 'vitest';
import { var_, lambda, app, let_, lit, prettyPrint } from './ast.js';
import { tInt, tBool, tArrow, tVar, prettyPrintType } from './types.js';
import { infer } from './infer.js';
import { TypeEnv } from './environment.js';

describe('Type Inference', () => {
  describe('Literals', () => {
    it('should infer Int type for number literals', () => {
      const expr = lit(42);
      const type = infer(expr);
      expect(prettyPrintType(type)).toBe('Int');
    });

    it('should infer Bool type for boolean literals', () => {
      const expr = lit(true);
      const type = infer(expr);
      expect(prettyPrintType(type)).toBe('Bool');
    });
  });

  describe('Lambda expressions', () => {
    it('should infer identity function type', () => {
      // λx. x
      const expr = lambda('x', var_('x'));
      const type = infer(expr);
      expect(prettyPrintType(type)).toMatch(/^t\d+ -> t\d+$/);
    });

    it('should infer K combinator type', () => {
      // λx. λy. x
      const expr = lambda('x', lambda('y', var_('x')));
      const type = infer(expr);
      expect(prettyPrintType(type)).toMatch(/^t\d+ -> t\d+ -> t\d+$/);
    });

    it('should infer constant function type', () => {
      // λx. 42
      const expr = lambda('x', lit(42));
      const type = infer(expr);
      expect(prettyPrintType(type)).toMatch(/^t\d+ -> Int$/);
    });
  });

  describe('Function application', () => {
    it('should infer type of identity applied to int', () => {
      // (λx. x) 42
      const expr = app(lambda('x', var_('x')), lit(42));
      const type = infer(expr);
      expect(prettyPrintType(type)).toBe('Int');
    });

    it('should infer type of identity applied to bool', () => {
      // (λx. x) true
      const expr = app(lambda('x', var_('x')), lit(true));
      const type = infer(expr);
      expect(prettyPrintType(type)).toBe('Bool');
    });

    it('should infer type of K combinator application', () => {
      // ((λx. λy. x) 42) true
      const k = lambda('x', lambda('y', var_('x')));
      const expr = app(app(k, lit(42)), lit(true));
      const type = infer(expr);
      expect(prettyPrintType(type)).toBe('Int');
    });
  });

  describe('Let expressions', () => {
    it('should support let polymorphism', () => {
      // let id = λx. x in id 42
      const expr = let_('id', 
        lambda('x', var_('x')), 
        app(var_('id'), lit(42))
      );
      const type = infer(expr);
      expect(prettyPrintType(type)).toBe('Int');
    });

    it('should allow polymorphic use of let-bound variables', () => {
      // let id = λx. x in (id 42, id true)
      // Note: We don't have pairs, so we'll test sequential application
      // let id = λx. x in (λ_. id true) (id 42)
      const expr = let_('id',
        lambda('x', var_('x')),
        app(
          lambda('_', app(var_('id'), lit(true))),
          app(var_('id'), lit(42))
        )
      );
      const type = infer(expr);
      expect(prettyPrintType(type)).toBe('Bool');
    });
  });

  describe('Type errors', () => {
    it('should throw error for unbound variable', () => {
      const expr = var_('undefined');
      expect(() => infer(expr)).toThrow('Unbound variable: undefined');
    });

    it('should throw error for type mismatch in application', () => {
      // (λx. x) true 42
      // This tries to apply 42 to the result of (λx. x) true, which is Bool
      const expr = app(app(lambda('x', var_('x')), lit(true)), lit(42));
      expect(() => infer(expr)).toThrow('Cannot unify');
    });
  });

  describe('With predefined environment', () => {
    it('should use types from environment', () => {
      const env = new TypeEnv();
      const addType = tArrow(tInt, tArrow(tInt, tInt));
      const extendedEnv = env.extend('add', { vars: [], type: addType });
      
      // add 1 2
      const expr = app(app(var_('add'), lit(1)), lit(2));
      const type = infer(expr, extendedEnv);
      expect(prettyPrintType(type)).toBe('Int');
    });
  });
});

describe('Pretty printing', () => {
  it('should pretty print expressions', () => {
    const expr = let_('f', 
      lambda('x', lambda('y', var_('x'))),
      app(app(var_('f'), lit(42)), lit(true))
    );
    const pretty = prettyPrint(expr);
    expect(pretty).toBe('let f = λx. λy. x in ((f 42) true)');
  });
});