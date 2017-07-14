import { TreeNode } from './tree-node';
export class TreeNodeIterator {
    constructor(private _curNode: TreeNode) {
    }

    public next(): TreeNode {

        // If node has any immediate children
        if (this._curNode.children.length > 0 && this._curNode.isExpanded) {
            this._curNode = this._curNode.children[0];
        }
        else {
            let curIndex = this._curNode.parent.children.indexOf(this._curNode);

            // If node has a lower sibling
            if (curIndex < this._curNode.parent.children.length - 1) {
                this._curNode = this._curNode.parent.children[curIndex + 1];
            }
            else if (this._curNode.parent.parent) {
                let nextAncestor = this._findNextAncestor(this._curNode);
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
    }

    public previous(): TreeNode {
        let curIndex = this._curNode.parent.children.indexOf(this._curNode);

        // If node has higher sibling
        if (curIndex > 0) {
            let prevSibling = this._curNode.parent.children[curIndex - 1];
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
    }

    private _findNextAncestor(curNode: TreeNode): TreeNode {

        if (curNode.parent.parent) {
            let parentIndex = curNode.parent.parent.children.indexOf(curNode.parent);
            if (parentIndex < curNode.parent.parent.children.length - 1) {
                return curNode.parent.parent.children[parentIndex + 1];
            }
            else {
                return this._findNextAncestor(curNode.parent);
            }
        }

        return null;
    }

    private _findLastDescendant(node: TreeNode) {
        if (node.isExpanded && node.children.length > 0) {
            return this._findLastDescendant(node.children[node.children.length - 1]);
        }
        else {
            return node;
        }
    }
}