"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TreeNodeIterator = (function () {
    function TreeNodeIterator(_curNode) {
        this._curNode = _curNode;
    }
    TreeNodeIterator.prototype.next = function () {
        // If node has any immediate children
        if (this._curNode.children.length > 0 && this._curNode.isExpanded) {
            this._curNode = this._curNode.children[0];
        }
        else {
            var curIndex = this._curNode.parent.children.indexOf(this._curNode);
            // If node has a lower sibling
            if (curIndex < this._curNode.parent.children.length - 1) {
                this._curNode = this._curNode.parent.children[curIndex + 1];
            }
            else if (this._curNode.parent.parent) {
                var nextAncestor = this._findNextAncestor(this._curNode);
                if (nextAncestor) {
                    this._curNode = nextAncestor;
                }
                else {
                    // You're at the end, but don't set node to null because
                    // a user may expand the current node, which will allow you
                    // to continue iterating if called again later.
                    return null;
                }
            }
            else {
                return null;
            }
        }
        return this._curNode;
    };
    TreeNodeIterator.prototype.previous = function () {
        var curIndex = this._curNode.parent.children.indexOf(this._curNode);
        // If node has higher sibling
        if (curIndex > 0) {
            var prevSibling = this._curNode.parent.children[curIndex - 1];
            this._curNode = this._findLastDescendant(prevSibling);
        }
        else if (this._curNode.parent.parent) {
            // Check to make sure we don't set curNode to a parent if it's
            // the root node which has no UI
            this._curNode = this._curNode.parent;
        }
        else {
            return null;
        }
        return this._curNode;
    };
    TreeNodeIterator.prototype._findNextAncestor = function (curNode) {
        if (curNode.parent.parent) {
            var parentIndex = curNode.parent.parent.children.indexOf(curNode.parent);
            if (parentIndex < curNode.parent.parent.children.length - 1) {
                return curNode.parent.parent.children[parentIndex + 1];
            }
            else {
                return this._findNextAncestor(curNode.parent);
            }
        }
        return null;
    };
    TreeNodeIterator.prototype._findLastDescendant = function (node) {
        if (node.isExpanded && node.children.length > 0) {
            return this._findLastDescendant(node.children[node.children.length - 1]);
        }
        else {
            return node;
        }
    };
    return TreeNodeIterator;
}());
exports.TreeNodeIterator = TreeNodeIterator;
//# sourceMappingURL=tree-node-iterator.js.map