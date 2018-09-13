const scopes = {
  io: {
    print: message => console.log(message),
  },
  list: {
    car: ([x, ...xs]) => x,
    cdr: ([x, ...xs]) => xs,
    length: list => list.length,
  },
};

const rootScope = {
  ...scopes.io,
  ...scopes.list,
};

const helloWorld =
  ['print', '"Hello, world!"'];

const exec = (prog, scope) =>
  prog; // TODO implement

exec(helloWorld, rootScope);
