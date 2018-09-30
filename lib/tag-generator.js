'use babel';

import fs from 'fs';
import path from 'path';

export default class TagGenerator {
  constructor(path1, scopeName) {
    this.path = path1;
    this.scopeName = scopeName;
  }

  getLanguage() {
    let needle;
    if (typeof this.path === 'string' && (needle = path.extname(this.path), ['.cson', '.gyp'].includes(needle))) {
      return 'Cson';
    }

    return {
      'source.c': 'c',
      'source.cpp': 'cpp',
      'source.clojure': 'lisp',
      'source.coffee': 'coffeescript',
      'source.css': 'css',
      'source.css.less': 'less',
      'source.css.scss': 'scss',
      'source.gfm': 'markdown',
      'source.go': 'go',
      'source.java': 'java',
      'source.js': 'javascript',
      'source.es6': 'javascript',
      'source.js.jsx': 'javascript',
      'source.jsx': 'javascript',
      'source.json': 'json',
      'source.makefile': 'make',
      'source.objc': 'c',
      'source.objcpp': 'cpp',
      'source.python': 'python',
      'source.ruby': 'ruby',
      'source.sass': 'sass',
      'source.yaml': 'yaml',
      'text.html': 'html',
      'text.html.basic': 'html',
      'text.html.php': 'php',
      'source.livecodescript': 'liveCode',
      'source.scilab': 'scilab', // Scilab
      'source.matlab': 'scilab', // Matlab
      'source.octave': 'scilab', // GNU Octave

      // For backward-compatibility with Atom versions < 0.166
      'source.c++': 'cpp',
      'source.objc++': 'cpp'
    }[this.scopeName];
  }

  async generate() {
    if (!this.lang) this.lang = this.getLanguage();
    if (!fs.statSync(this.path).isFile()) return {};

    let Gen;
    try {
      Gen = require(`./tag-generators/${this.lang}`);
    } catch (e) {
      Gen = require('./tag-generators/universal');
    }

    const ctx = {
      file: this.path,
      content: fs.readFileSync(this.path, 'utf8'),
      lang: this.lang
    };
    let tags = await Gen.parseFile(ctx); // tags contains list and tree data structure

    // For inline script in HTML
    if (tags.scriptNode && tags.scriptNode.length) await this.inlineScriptHandler(tags.scriptNode, ctx);
    return tags;
  }

  async inlineScriptHandler(nodes, ctx) {
    let parser = require('./tag-generators/javascript');
    for (let i in nodes) {
      let parent = nodes[i];
      let tags = await parser.parseFile({
                  content: parent.content,
                  file: ctx.file
                });
      if (tags.tree && Object.keys(tags.tree).length) {
        parent.child = tags.tree;
        this.fixLineno(parent);
      }
      // If JS error exists, jsctags would work
      else if (tags.list) {
        if (!parent.child) parent.child = {};
        for (let j in tags.list) {
          let item = tags.list[j];
          parent.child[item.id] = item;
        }
        this.fixLineno(parent);
      }
    }
  }

  fixLineno(parent, baseLineno) {
    // Line number of root node is the base number
    if (!baseLineno) baseLineno = parent.lineno;
    for (let i in parent.child) {
      let child = parent.child[i];
      child.lineno += baseLineno - 1;
      if (child.child) this.fixLineno(child, baseLineno);
    }
  }
}
