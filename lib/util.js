'use babel';
import $ from 'jquery';

export default {
  getScrollDistance($child, $parent) {
    const viewTop = $parent.offset().top,
      viewBottom = viewTop + $parent.height(),
      scrollTop = $parent.scrollTop(),
      scrollBottom = scrollTop + $parent.height(),
      elemTop = $child.offset().top,
      elemBottom = elemTop + $child.height();

    const ret = {
      needScroll: true,
      distance: 0
    };
    // Element is upon or under the view
    if ((elemTop < viewTop) || (elemBottom > viewBottom)) ret.distance = scrollTop + elemTop - viewTop;
    else ret.needScroll = false;

    return ret;
  },

  selectTreeNode($target, vm, opts) {
    if ($target.is('span')) $target = $target.parent();
    if ($target.is('div')) $target = $target.parent();
    if ($target.is('li')) {
      // ".toggle" would be TRUE if it's double click
      if (opts && opts.toggle) {
        $target.hasClass('list-nested-item') && $target[$target.hasClass('collapsed') ? 'removeClass' : 'addClass']('collapsed');
      }
      let oldVal = vm.treeNodeId,
        val = $target.attr('node-id');

      // Same node
      if (oldVal === val) return;

      oldVal && $('div.structure-view>div.tree-panel>ol').find('li.selected').removeClass('selected');
      $target.addClass('selected');
      vm.treeNodeId = val;
    }
  },

  notify(title, msg) {
    atom.notifications.addInfo(title, { detail: msg, dismissable: true });
  },

  alert(title, msg) {
    atom.confirm({
      message: title,
      detailedMessage: msg,
      buttons: {
        Close: function() {
          return;
        }
      }
    });
  }
};
