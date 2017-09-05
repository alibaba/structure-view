'use babel';
import path from 'path';
import { BufferedProcess } from 'atom';

export default {
  parseFile(ctx) {
    const command = path.resolve(__dirname, '..', '..', 'vendor', `universal-ctags-${process.platform}`),
      defaultCtagsFile = require.resolve('./.ctags'),
      self = this;
    let tags = [],
      args = [`--options=${defaultCtagsFile}`, '--fields=KsS'];

    // Not used
    if (atom.config.get('structure-view.useEditorGrammarAsCtagsLanguage') && ctx.lang) {
      args.push(`--language-force=${ctx.lang}`);
    }
    args.push('-nf', '-', ctx.file);

    return new Promise(resolve => {
      return new BufferedProcess({
        command: command,
        args: args,
        stdout(lines) {
          return (() => {
            let result = [];
            for (let line of Array.from(lines.split('\n'))) {
              let tag = self.parseTagLine(line.trim(), ctx.lang);
              if (tag) result.push(tags.push(tag));
              else result.push(undefined);
            }
            return result;
          })();
        },
        // TODO: ctags config file may has something wrong that lead to warning info
        stderr(e) {
          // console.warn(e);
        },
        exit() {
          // Tag properties: name, kind, type, lineno, parent, id
          let count = 0;
          for (let i in tags) {
            tags[i].id = count;
            count++;
          }
          resolve({
            list: tags,
            tree: null
          });
        }
      });
    });
  },
  parseTagLine(line, lang) {
    let sections = line.split('\t');
    if (sections.length > 3) {
      let tag = {
        name: sections[0],
        kind: sections[3],
        type: 'unknown',
        lineno: parseInt(sections[2]),
        parent: null
      };
      // Not work for HTML at least
      if ((lang === 'Python') && (tag.type === 'member')) {
        tag.type = 'function';
      }
      return tag;
    } else {
      return null;
    }
  }
};
