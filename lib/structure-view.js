'use babel';

import Vue from 'vue';
import $ from 'jquery';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import TagGenerator from './tag-generator';
import TagParser from './tag-parser';
import Util from './util';

export default class StructureView {

  constructor() {
    const htmlString = fs.readFileSync(path.join(__dirname, '..', 'templates', 'structure-view.html'), {
      encoding: 'utf-8'
    });
    this.element = $(htmlString).get(0);
    this.viewType = 'structureView';
    this.vm = new Vue({
      el: this.element,
      data: {
        treeNodeId: null,
        nodeSet: {},
        cursorListener: null,
        textEditorListener: null,
        editorSaveListener: {},
        viewLoading: true,
        noTagHint: null,
        lastFile: null
      },
      methods: {
        onToggleTreeNode(evt) {
          Util.selectTreeNode($(evt.target), this, {
            toggle: true
          });
        },
      },
      watch: {
        treeNodeId(val) {
          if (!this.lastFile) return;
          let position = this.nodeSet[val].position,
            // getActiveTextEditor can not get editor after click left tree when on windows before v1.8.0
            editor = atom.workspace.getTextEditors().find(i => {
              return i.getPath() === this.lastFile;
            });
          if (editor) {
            // lines can be soft-wrapped
            if (editor.isSoftWrapped()) {
              editor.setCursorBufferPosition(position);
            } else {
              editor.setCursorScreenPosition(position);
            }
            editor.scrollToCursorPosition();
          }
        },
        viewLoading(val) {
          $(this.$el).find('.mask')[val ? 'show' : 'hide']();
        }
      }
    });
  }

  initialize() {
    this.vm.viewLoading = true;
    this.render();
    if (atom.config.get('structure-view.SelectTagWhenCursorChanged')) {
      this.listenOnCursorPositionChange();
    }
    this.listenOnTextEditorChange();
    this.listenOnTextEditorSave(atom.workspace.getActiveTextEditor());
  }

  async render(filePath) {
    let editor = atom.workspace.getActiveTextEditor();
    if (!filePath && editor) {
      filePath = editor.getPath();
    }
    if (filePath) {
      let scopeName = editor.getGrammar().scopeName;
      let tags = await new TagGenerator(filePath, scopeName).generate();
      if (tags.err) {
        this.vm.noTagHint = tags.err;
      } else {
        (new TagParser(tags, 'javascript')).parser();

        if (tags.list && Object.keys(tags.list).length > 0) {
          this.renderTree(tags.tree);
          this.vm.nodeSet = tags.list;
          this.vm.noTagHint = null;
        } else this.vm.noTagHint = 'No tag in the file.';
      }
      this.vm.lastFile = filePath;
    }
    else this.vm.noTagHint = 'No file is opened.';
    this.vm.viewLoading = false;
  }

  renderTree(nodes) {
    let html = this.treeGenerator(nodes);
    $('div.structure-view>div>ol').html(html);
  }

  listenOnCursorPositionChange() {
    const self = this,
      activeEditor = atom.workspace.getActiveTextEditor();
    if (activeEditor) {
      this.vm.cursorListener = activeEditor.onDidChangeCursorPosition(e => {
        let nRow = e.newScreenPosition.row;
        if (nRow !== e.oldScreenPosition.row) {
          let tag = _.find(self.vm.nodeSet, item => {
            return item.position.row === nRow;
          });
          // Same node would not change view
          if (tag && tag.id !== self.treeNodeId) {
            let $tag = $(this.element).find(`li[node-id="${tag.id}"]`);
            if ($tag.length > 0) {
              // {top: 0, left: 0} means node is hidden
              // TODO: expand parent tree node
              if ($tag.offset().top === 0 && $tag.offset().left === 0) return;

              Util.selectTreeNode($tag, this);
              let ret = Util.getScrollDistance($tag, $(this.element));
              if (ret.needScroll) $(this.element).scrollTop(ret.distance);
            }
          }
        }
      });
    }
  }

  listenOnTextEditorChange() {
    if (this.vm.textEditorListener) return;

    const self = this;
    // ::onDidChangeActiveTextEditor API is only supported after 1.18.0
    // this.vm.textEditorListener = atom.workspace.onDidChangeActiveTextEditor(editor => {
    const rightDock = atom.workspace.getRightDock();
    if (atom.appVersion >= '1.18') {
      this.vm.textEditorListener = atom.workspace.onDidChangeActiveTextEditor(editor => {
        if (editor) {
          // Do not show view when view is hidden by user
          if (!rightDock.isVisible() && !self.vm.lastFile) rightDock.show();

          // For changed file
          self.render(editor.getPath());

          // Add save event listener
          self.listenOnTextEditorSave(editor);
        } else {
          rightDock.hide();
          self.vm.lastFile = '';
        }
      });
    } else {
      this.vm.textEditorListener = atom.workspace.onDidChangeActivePaneItem(editor => {
        // Ensure pane item is an edior
        if (editor && 'ATOM-TEXT-EDITOR' === editor.element.nodeName) {
          if (!rightDock.isVisible() && !self.vm.lastFile) rightDock.show();

          // Skip render if file is not changed and view has content
          if (self.vm.lastFile === editor.getPath() && !self.vm.noTagHint) return;

          self.render(editor.getPath());
          // Add save event listener
          self.listenOnTextEditorSave(editor);
        }
        // Do nothing if click SV itself
        else if (editor && 'structureView' === editor.viewType);
        // Do not close right dock if other item exists
        else if (rightDock.getPaneItems().length > 1) {
          self.render();
        } else {
          rightDock.hide();
          self.vm.lastFile = '';
        }
      });
    }
  }

  listenOnTextEditorSave(editor) {
    if (editor) {
      const listener = this.vm.editorSaveListener,
        self = this;
      if (!listener[editor.id]) listener[editor.id] = editor.onDidSave(i => {
        self.render(i.path);
      });
    }
  }

  treeGenerator(data) {
    const self = this;
    let array = [],
      letter;

    _.forEach(data, item => {
      switch (item.type) {

        case 'sel':       // CSS
        case 'selector':  // LESS, SASS
          letter = 'S';
          break;
        case 'prop':      // CSS
          letter = 'P';
          break;

        case 'elem':      // HTML
          letter = '';
          break;

        case 'class':     // JS
          letter = 'C';
          break;
        case 'import':    // JS
          letter = 'I';
          break;
        case 'function':  // JS, C
          letter = 'F';
          break;
        case 'method':    // JS
        case 'member':    // JSON, CSON, MARKDOWN
          letter = 'M';
          break;
        case 'var':       // JS
        case 'variable':  // C
        case 'macro':
          letter = 'V';
          break;

        default:
          letter = 'U';
          break;
      }
      let iconTpl;
      if (item.type === 'elem') iconTpl = `<span class="icon icon-code"></span>`;
      else iconTpl = `<div class="icon-circle icon-${letter}"><span>${letter}</span></div>`;

      array.push(item.child ?
        `<li node-id="${item.id}" class="list-nested-item expanded" title="${item.name}">
                    <div class="list-item symbol-mixed-block">
                        ${iconTpl}
                        <span>${item.name}</span>
                    </div>
                    <ol class="list-tree">${self.treeGenerator(item.child)}</ol>
                </li>` :
        `<li node-id="${item.id}" class="list-item" title="${item.name}">
                    <div class="symbol-mixed-block">
                        ${iconTpl}
                        <span>${item.name}</span>
                    </div>
                </li>`
      );
    });
    return array.join('');
  }

  serialize() {}

  destroy() {
    this.element.remove();
    if (this.vm.cursorListener) {
      this.vm.cursorListener.dispose();
      this.vm.cursorListener = null;
    }
    if (this.vm.textEditorListener) {
      this.vm.textEditorListener.dispose();
      this.vm.textEditorListener = null;
    }
    _.forEach(this.vm.editorSaveListener, item => {
      item.dispose()
    });
    this.vm.editorSaveListener = {};
    // this.vm.$destroy();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return 'Structure View';
  }
}
