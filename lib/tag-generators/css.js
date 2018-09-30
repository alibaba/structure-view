'use babel';
import css from 'css';

export default {
  parseFile(ctx) {
    const ast = css.parse(ctx.content).stylesheet;
    if (!ast || ast.parsingErrors.length > 0) {
      atom.notifications.addError(`Parsing CSS source code failed!`, {
        detail: ast.parsingErrors.join('\n'),
        dismissable: true
      });
      return {
        list: {},
        tree: null
      };
    }

    const tags = {};
    this.parseAst(tags, ast.rules);
    // Parent of first level node is stylesheet
    for (let i in tags) tags[i].parent = null;

    return {
      list: {},
      tree: tags
    };
  },

  parseAst(tags, ast) {
    for (let key in ast) {
      const i = ast[key],
        line = i.position.start.line;
      if ('rule' === i.type) {
        const name = i.selectors.join(',\n'),
          id = `${line}-${name}`;
        tags[id] = {
          name: name,
          type: 'sel',
          lineno: line,
          parent: i.parent,
          id: id
        };
        if (i.declarations.length > 0) {
          tags[id].child = {};
          this.parseAst(tags[id].child, i.declarations);
        }
      } else if ('declaration' === i.type) {
        const name = i.property,
          // value = i.value,
          id = `${line}-${name}`;
        tags[id] = {
          name: name,
          type: 'prop',
          lineno: line,
          parent: i.parent,
          id: id
        }
      }
    }
  }
}
