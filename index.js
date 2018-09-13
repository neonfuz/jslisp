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
const parseLambda = ([keys, prog], scope) => (...args) => exec(prog, {...scope, objZip(keys, args)});
const getFunc = (sym, scope) =>
  Array.isArray(sym) ?
  exec(sym, scope) :
  sym in scope ?
  scope[sym];

const exec = (prog, scope) => {
  const { car, cdr } = stdlib;
  const sym = car(prog);
  const args = cdr(prog);
  switch (sym) {
    case 'quote': return car(args);
    case 'lambda': return parseLambda(args, scope);
    default: return getFunc(sym, scope).apply(null, args);
  }
  return prog;
};

const add2 = ['lambda', ['a', 'b'], ['+', 'a', 'b']];

const helloWorld = ['print', q('Hello, world!')];

exec(helloWorld, stdlib);
