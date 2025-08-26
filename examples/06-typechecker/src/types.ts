// src/types.ts

// A type variable, represented by a unique ID.
export type TVar = { tag: 'TVar'; id: number };
// A concrete type constructor, like 'Int' or '->' (function).
export type TCon = { tag: 'TCon'; name: string };
// A type application, which applies type arguments to a type constructor.
// For example, a function type 'a -> b' is TApp(TCon('->'), [TVar('a'), TVar('b')]).
export type TApp = { tag: 'TApp'; constructor: Type; args: Type[] };

// Union of all possible types.
export type Type = TVar | TCon | TApp;

// A type scheme, which represents a polymorphic type.
// 'forall a. a -> a' would be represented as a Scheme with one variable
// and a function type as its body.
export type Scheme = { tag: 'Scheme'; variables: number[]; type: Type };

// --- Type Constructors ---
export const TVar = (id: number): TVar => ({ tag: 'TVar', id });
export const TCon = (name: string): TCon => ({ tag: 'TCon', name });
export const TApp = (constructor: Type, args: Type[]): TApp => ({ tag: 'TApp', constructor, args });
export const Scheme = (variables: number[], type: Type): Scheme => ({ tag: 'Scheme', variables, type });

// --- Concrete Types ---
export const tInt = TCon('Int');
export const tBool = TCon('Bool');
export const tArrow = TCon('->');

// Helper to create a function type: t1 -> t2
export const fn = (t1: Type, t2: Type): TApp => TApp(tArrow, [t1, t2]);

// --- Type Utilities ---
let nextTypeId = 0;
export const freshVar = (): TVar => TVar(nextTypeId++);
export const resetTypeId = () => { nextTypeId = 0; };

// --- Type to String Conversion (for debugging) ---
const varName = (id: number): string => {
    const a = 'a'.charCodeAt(0);
    return String.fromCharCode(a + (id % 26));
}

export const typeToString = (type: Type): string => {
    switch (type.tag) {
        case 'TVar':
            return varName(type.id);
        case 'TCon':
            return type.name;
        case 'TApp':
            if (type.constructor.tag === 'TCon' && type.constructor.name === '->' && type.args.length === 2) {
                const [arg, ret] = type.args;
                const argStr = (arg.tag === 'TApp' && arg.constructor.tag === 'TCon' && arg.constructor.name === '->') 
                    ? `(${typeToString(arg)})` 
                    : typeToString(arg);
                return `${argStr} -> ${typeToString(ret)}`;
            }
            return `${typeToString(type.constructor)} ${type.args.map(typeToString).join(' ')}`;
    }
};
