'use babel';
import { CompositeDisposable } from 'atom';
import $ from 'jquery';
import StructureView from './structure-view';
import Util from './util';

export default {
  structureView: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'structure-view:toggle': () => this.switch(),
      'structure-view:show': () => this.switch('on'),
      'structure-view:hide': () => this.switch('off'),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.structureView.destroy();
  },

  serialize() {},

  switch (stat) {
    let editors = atom.workspace.getTextEditors();
    if (editors.length < 1 ||
      (editors.length === 1 && !editors[0].getPath())) return Util.alert('WARN', 'No file is opened!');

    if (!this.structureView) this.structureView = new StructureView();

    const rightDock = atom.workspace.getRightDock();
    try {
      // Whatever do these first for performance
      rightDock.getPanes()[0].addItem(this.structureView);
      rightDock.getPanes()[0].activateItem(this.structureView);
    } catch (e) {
      if (e.message.includes('can only contain one instance of item')) {
        this.handleOneInstanceError();
      }
    }

    // Sometimes dock title is hidden for somehow,
    // so force recalculate here to redraw
    $('ul.list-inline.tab-bar.inset-panel').height();

    if (!stat) rightDock.toggle();
    else if ('on' === stat) rightDock.show();
    else if ('off' === stat) rightDock.hide();

    if (rightDock.isVisible()) this.structureView.initialize();
  },

  handleOneInstanceError() {
    let activePane = null;
    const rightDock = atom.workspace.getRightDock();
    atom.workspace.getPanes().forEach(pane => {
      pane.getItems().forEach(item => {
        if (item === this.structureView) activePane = pane;
      });
    });
    if (activePane) {
      activePane.destroyItem(this.structureView, true);
      this.structureView.destroy();
    }

    rightDock.getPanes()[0].addItem(this.structureView);
    rightDock.getPanes()[0].activateItem(this.structureView);
  }
}
