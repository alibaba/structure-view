'use babel';

import HtmlParser from 'htmlparser2';
import path from 'path';

export default {

  parseFile(ctx) {
    const self = this;
    this.scriptNode = [];

    return new Promise(resolve => {
      const handler = new HtmlParser.DomHandler((err, dom) => {
        if (err) console.log(err);
        else {
          let tags = self.parseTags(dom);
          resolve(tags);
        }
      });
      const parser = new HtmlParser.Parser(handler);
      parser.write(ctx.content);
      parser.end();
    });
  },

  parseTags(tags) {
    const lineCountStart = 1; // First line is no.1
    const res = {};
    this.setTagsLineno(res, tags, lineCountStart);
    return {
      tree: res,
      list: {},
      scriptNode: this.scriptNode
    };
  },

  setTagsLineno(res, tags, line) {
    tags.forEach((i, index) => {
      const childs = i.children,
        data = i.data;
      if (childs) {
        const id = `${line}-${i.name}-${index}`;

        // Make symbol as element with its class, like div.a-class
        let name = i.name,
          attr = i.attribs;
        if (attr && attr.class) {
          name += '.' + attr.class.replace(' ', '.');
        }

        res[id] = {
          name: name,
          type: 'elem',
          lineno: line,
          parent: i.parent,
          id: id
        }
        if (childs.length > 0) {
          res[id].child = {};
          line = this.setTagsLineno(res[id].child, childs, line);

          // Inline script in HTML
          if (i.name === 'script') {
            res[id].content = childs[0].data;
            this.scriptNode.push(res[id]);
          }
        }
      }
      else if (data && data.includes('\n')) line += data.split('\n').length - 1;
    });

    return line;
  }
};
