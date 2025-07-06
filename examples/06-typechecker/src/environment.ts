import type { TypeScheme, Type } from './types.js';
import { freeTypeVars } from './types.js';

export class TypeEnv {
  private env: Map<string, TypeScheme>;

  constructor(env: Map<string, TypeScheme> = new Map()) {
    this.env = env;
  }

  extend(name: string, scheme: TypeScheme): TypeEnv {
    const newEnv = new Map(this.env);
    newEnv.set(name, scheme);
    return new TypeEnv(newEnv);
  }

  lookup(name: string): TypeScheme | undefined {
    return this.env.get(name);
  }

  freeTypeVars(): Set<string> {
    const vars = new Set<string>();
    for (const scheme of this.env.values()) {
      const schemeVars = freeTypeVars(scheme.type);
      for (const v of schemeVars) {
        if (!scheme.vars.includes(v)) {
          vars.add(v);
        }
      }
    }
    return vars;
  }
}