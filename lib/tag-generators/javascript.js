'use babel';

export default {

  init() {
    this.esprima = require('esprima');
  },

  async parseFile(ctx) {
    if (!this.esprima) this.init();

    const self = this,
      esprima = this.esprima,
      tags = {};

    let ast;
    try {
      ast = esprima.parseScript(ctx.content, {
        loc: true,
        tolerant: true
      });
    } catch (e) {
      console.error(`${e}\n\nTry to use other parsing solution...`);
      // return {
      //     err: `Error!!!\nLine number: ${e.lineNumber}\nDescription: ${e.description}`
      // };
      const jsctags = require('./javascript-sub');
      return (await jsctags.parseFile(ctx));
    }

    this.parseDeclar(tags, ast.body);
    // Parent of first level node is script
    for (let i in tags) tags[i].parent = null;

    return {
      list: {},
      tree: tags
    };
  },

  parseDeclar(tags, ast) {
    const self = this;
    ast.forEach(i => {
      let type = i.type,
        child = null,
        name, id;

      // More types support please refer to esprima source code
      const oneTagType = ['ClassDeclaration', 'ExpressionStatement', 'ExportDefaultDeclaration', 'FunctionDeclaration', 'MethodDefinition'];
      const multiTagsType = ['ImportDeclaration', 'VariableDeclaration'];

      if (oneTagType.includes(type)) {
        const line = i.loc.start.line;
        if ('ClassDeclaration' === type) {
          name = i.id.name;
          id = `${line}-${name}`;
          type = 'class';

          if (i.body.body.length > 0) {
            child = {};
            self.parseDeclar(child, i.body.body);
          }
        }
        // Only for `module.exports` now
        else if ('ExpressionStatement' === type) {
          let left = i.expression.left,
            right = i.expression.right;
          if (!left || !left.object || !left.property || !right) return;

          if ('module' !== left.object.name || 'exports' !== left.property.name) return;
          if ('ClassExpression' !== right.type && 'ObjectExpression' !== right.type) return;

          name = 'exports';
          id = `${line}-${name}`;
          type = 'class';
          child = {};

          if ('ClassExpression' === right.type) self.parseDeclar(child, right.body.body);
          else if ('ObjectExpression' === right.type) self.parseExpr(child, right.properties);
        } else if ('ExportDefaultDeclaration' === type) {
          name = 'exports';
          id = `${line}-${name}`;
          type = 'class';

          let dec = i.declaration;
          if ('ObjectExpression' === dec.type && dec.properties.length > 0) {
            child = {};
            self.parseExpr(child, dec.properties);
          } else if ('ClassDeclaration' === dec.type && dec.body.body.length > 0) {
            child = {};
            self.parseExpr(child, dec.body.body)
          } else if ('FunctionDeclaration' === dec.type && dec.body.body.length > 0) {
            type = 'func';
            child = {};
            self.parseDeclar(child, dec.body.body);
          }
        } else if ('FunctionDeclaration' === type) {
          let params = [];
          i.params.forEach(p => {
            params.push(p.name);
          });
          name = `${i.id.name}(${params.join(', ')})`;
          id = `${line}-${i.id.name}()`;
          type = 'func';

          if (i.body.body.length > 0) {
            child = {};
            self.parseDeclar(child, i.body.body);
          }
        } else if ('MethodDefinition' === type) {
          let params = [];
          i.value.params.forEach(p => {
            params.push(p.name);
          });
          name = `${i.key.name}(${params.join(', ')})`;
          id = `${line}-${i.key.name}()`;
          type = 'method';

          if (i.value.body.body.length > 0) {
            child = {};
            self.parseDeclar(child, i.value.body.body);
          }
        }

        tags[id] = {
          name: name,
          type: type,
          lineno: line,
          parent: ast,
          child: child,
          id: id
        };
      } else if (multiTagsType.includes(type)) {
        if ('ImportDeclaration' === type) {
          i.specifiers.forEach(sp => {
            let line = sp.loc.start.line;
            name = sp.local.name;
            id = `${line}-${name}`;
            type = 'import';

            tags[id] = {
              name: name,
              type: type,
              lineno: line,
              parent: ast,
              child: child,
              id: id
            }
          });
        } else if ('VariableDeclaration' === type) {
          i.declarations.forEach(v => {
            let line = v.loc.start.line;
            name = v.id.name;
            id = `${line}-${name}`;
            type = 'var';

            if (v.init && 'CallExpression' === v.init.type) {
              let method = v.init.callee.property;
              if (method && method.name === 'extend') {
                child = {};
                v.init.arguments.forEach(i => {
                  if (i.properties) self.parseExpr(child, i.properties);
                });
              }
            } else if (v.init && 'ObjectExpression' === v.init.type) {
              if (v.init.properties.length > 0) {
                child = {};
                self.parseExpr(child, v.init.properties);
              }
            }

            tags[id] = {
              name: name,
              type: type,
              lineno: line,
              parent: ast,
              child: child,
              id: id
            }
          });
        }
      }
    });
  },

  parseExpr(tags, ast) {
    const self = this;
    ast.forEach(i => {
      let type = i.value.type,
        line = i.loc.start.line,
        child = null,
        name, id;

      if ('FunctionExpression' === type) {
        let params = [];
        i.value.params.forEach(p => {
          params.push(p.name);
        });

        name = `${i.key.name}(${params.join(', ')})`;
        id = `${line}-${i.key.name}()`;
        type = 'func';

        if (i.value.body.body.length > 0) {
          child = {};
          self.parseDeclar(child, i.value.body.body);
        }

        tags[id] = {
          name: name,
          type: type,
          lineno: line,
          parent: ast,
          child: child,
          id: id
        };
      } else {
        type = 'prop';
        name = i.key.value;
        if (i.key.value) name = i.key.value;
        else name = i.key.name;
        id = `${line}-${name}`;

        if (i.value.properties && i.value.properties.length > 0) {
          child = {};
          self.parseExpr(child, i.value.properties);
        }

        tags[id] = {
          name: name,
          type: type,
          lineno: line,
          parent: ast,
          child: child,
          id: id
        };
      }
    });
  }
};
