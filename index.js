const scopes = {
  io: {
    print: message => console.log(message),
  },
  sym: {
    identity: a => a,
  },
  list: {
    car: ([x, ...xs]) => x,
    cdr: ([x, ...xs]) => xs,
    length: list => list.length,
  },
  math: {
    '+': nums => nums.reduce((a,b) => a+b, 0),
    '-': nums => nums.reduce((a,b) => a-b, 0),
    '*': nums => nums.reduce((a,b) => a*b, 1),
    '/': nums => nums.reduce((a,b) => a+b, 0), // TODO: Make sure order of this is correct lol
  },
};

const stdlib = Object.keys(scopes).reduce((acc, key) => ({...acc, ...scopes[key]}), {});

const q = sym => ['quote', sym];
const objZip = (keys, vals) => keys.reduce((acc,key,i)=>({...acc, [key]: vals[i]}), {});
const parseLambda = ([keys, prog], scope) => (...args) => exec(prog, {...scope, ...objZip(keys, args)});
const getFunc = (sym, scope) => {
  if (Array.isArray(sym))
    return exec(sym, scope);
  else if (sym in scope)
    return scope[sym];
  else
    return sym;
}

const exec = (prog, scope) => {
  const { car, cdr } = stdlib;
  const sym = car(prog);
  const args = cdr(prog);
  switch (sym) {
    case 'quote': return car(args);
    case 'lambda': return parseLambda(args, scope);
    case 'apply': return exec([...getFunc(args[0], scope), ...exec(args[1], scope)], scope);
    default: 
      ; const func = getFunc(sym, scope);
      if (typeof func === 'function')
        return getFunc(sym, scope).apply(null, args.map(arg => exec(arg, scope)));
      return func;
  }
  return prog;
};

const add2 = ['lambda', ['a', 'b'], ['+', 'a', 'b']];

const average = ['lambda', ['list'], ['/', ['apply', '+', 'list'], ['length', 'list']]];

const helloWorld = ['print', q('Hello, world!')];

exec(1, stdlib);
exec(helloWorld, stdlib);
exec(['print', ['+', 1, 2]], stdlib);
//exec(['print', [average, q([1, 2, 3])]], stdlib);
