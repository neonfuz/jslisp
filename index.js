const scopes = {
  io: {
    print: (...messages) => console.log(...messages),
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
    '+': (...nums) => nums.reduce((a,b) => a+b, 0),
    '-': (...nums) => nums.reduce((a,b) => a-b, 0),
    '*': (...nums) => nums.reduce((a,b) => a*b, 1),
    '/': (...nums) => nums.reduce((a,b) => a/b),
  },
};

const constants = {
  quote: Symbol('quote'), lambda: Symbol('lambda'), apply: Symbol('apply'),
};

// Flattens out one level of an object
const objMerge = obj => Object
  .keys(obj)
  .map(key => obj[key])
  .reduce((a, b) => ({...a, ...b}), {});

const stdlib = { ...objMerge(scopes), ...constants };

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

const getLexType = prog => {
  switch (typeof prog) {
    case 'number': return 'number';
    case 'string':
      if (prog.match(/^".*"$/))
        return 'string';
      else
        return 'symbol';
    case 'object':
      if (Array.isArray(prog))
        return 'list';
      else
        return 'object';
  }
};

const exec = (prog, scope) => {
  const type = getLexType(prog);
  switch (type) {
    case 'number': return prog;
    case 'string': return prog;
    case 'symbol':
      if (prog in scope) return scope[prog];
      else throw `Error: Symbol '${prog}' undefined.`;
    case 'list':
      const [head, ...tail] = prog;
      const func = exec(head, scope);
      switch (func) {
        case constants.quote: return tail[0];
        case constants.lambda: return parseLambda(tail, scope);
        case constants.apply:
          const [ahead, ...atail] = tail;
          const afunc = exec(ahead, scope);
          return afunc.apply(null, atail.map(arg => exec(arg, scope)));
        default:
          if (typeof func !== 'function')
            throw `Error: tried executing non function '${JSON.stringify(func)}'`
          return func.apply(null, tail.map(arg => exec(arg, scope)));
      }
    case 'object':
      throw 'Error: encountered JS object (undefined)';
  }
};


const add2 = ['lambda', ['a', 'b'], ['+', 'a', 'b']];

const average = ['lambda', ['list'], ['/', ['apply', '+', 'list'], ['length', 'list']]];

const helloWorld = ['print', q('Hello, world!')];

exec(helloWorld, stdlib);
exec(['print', q('Addition test: '), ['+', 1, 2]], stdlib);
exec(['print', q('Lambda test: '), [add2, 1, 2]], stdlib);
exec(['print', ['/', 2, 3]], stdlib);
exec(['print', [average, q([1, 2, 3])]], stdlib);
