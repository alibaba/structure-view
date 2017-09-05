'use babel';
import jsctags from 'jsctags';
import path from 'path';

export default {

  async parseFile(ctx) {
    ctx.dir = path.dirname(ctx.file);
    const self = this,
      tags = await new Promise(resolve => {
        jsctags(ctx, (e, tags) => {
          if (e) console.log(e);
          resolve(self.parseTags(tags));
        });
      });
    return {
      list: tags,
      tree: null
    };
  },

  parseTags(tags) {
    console.log(tags)
    let res = {};
    for (let i in tags) {
      // jsctags only provides two type of tag kind: "var", "func"
      if ('v' === tags[i].kind) tags[i].kind = 'var';
      else if ('f' === tags[i].kind) tags[i].kind = 'func';

      res[tags[i].id] = {
        name: tags[i].name,
        type: tags[i].kind,
        lineno: tags[i].lineno,
        // namespace: tags[i].namespace,
        parent: tags[i].namespace ? tags[i].parent : null,
        id: tags[i].id
      };
    }
    return res;
  }
};
