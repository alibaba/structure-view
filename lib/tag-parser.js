'use babel';
import { Point } from 'atom';
import _ from 'lodash';

export default class TagParser {
    constructor(tags, lang) {
        this.tags = tags;
        this.lang = lang;
    }

    parser() {
        if (this.tags.tree) {
            this.tags.list = {};
            this.treeToList(this.tags.list, this.tags.tree);
            return this.tags.tree;
        }
        else if (this.tags.list) {
            let res = {},
                data = this.tags.list;
            if (Object.keys(data).length === 0) return res;

            // Let items without parent as root node
            let childs = [],
                tagSet = {};
            _.forEach(data, item => {
                item.position = new Point(item.lineno - 1);
                if (!item.parent) res[item.id] = item;
                else childs.push(item);
                tagSet[item.id] = item;
            });

            let missed = [];
            _.forEach(childs, item => {
                // Save missed child if cannot find its parent in all tags
                if (!tagSet[item.parent]) missed.push(item);
                else {
                    if (!tagSet[item.parent].child) tagSet[item.parent].child = {};
                    tagSet[item.parent].child[item.id] = item;
                }
            });

            if (missed) {
                _.forEach(missed, item => {
                    res[item.id] = item;
                });
            }

            this.tags.tree = res;
        }
    }

    treeToList(list, tree) {
        const self = this;
        _.forEach(tree, (item, index) => {
            if (item.child && Object.keys(item.child).length === 0) delete item.child;
            item.position = new Point(item.lineno - 1);
            list[index] = item;
            if (item.child) self.treeToList(list, item.child);
        });
    }
};
