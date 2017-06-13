import { StartupInfo } from './../shared/models/portal';
import { TreeNodeIterator } from './tree-node-iterator';
import { TreeNode } from './tree-node';
import { AppModule } from './../app.module';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TreeViewComponent } from './tree-view.component';

describe('TreeViewComponent', () => {
  let component: TreeViewComponent;
  let fixture: ComponentFixture<TreeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the next sibling when not expanded', () =>{
    let root = getMockTree();
    let iterator = new TreeNodeIterator(root.children[0]);

    let results : string[] = ['a', 'b', null];
    runTest(root.children[0], results, true /* forward */);
  })

  it('should return the next siblings children when expanded', () =>{
    let root = getMockTree();
    expandAllDescendants(root);

    let results : string[] = ['a', 'a1', 'a2', 'a2x', 'a3', 'b', 'b1', null];
    runTest(root.children[0], results, true /* forward */);
  })

  it('should return the previous sibling when not expanded', () =>{
    let root = getMockTree();
    let startNode = root.children[root.children.length - 1];
    let iterator = new TreeNodeIterator(startNode);

    let results : string[] = ['b', 'a', null];
    runTest(startNode, results, false /* backward */);
  })

  it('should return the previous siblings descendents when expanded', () =>{
    let root = getMockTree();
    expandAllDescendants(root);
    
    let startNode = getLastDescendantNode(root);
    let iterator = new TreeNodeIterator(startNode);

    let results : string[] = ['b1', 'b', 'a3', 'a2x', 'a2', 'a1', 'a', null];
    runTest(startNode, results, false /* backward */);
  })


  function getMockTree(){
    let root = new TreeNode(null, null, null);
    root.title = "root";

    let a = new TreeNode(null, null, root);
    a.title = "a";

    let a1 = new TreeNode(null, null, a);
    a1.title = "a1";

    let a2 = new TreeNode(null, null, a);
    a2.title = "a2";

    let a2x = new TreeNode(null, null, a2);
    a2x.title = "a2x";

    let a3 = new TreeNode(null, null, a);
    a3.title = "a3";

    let b = new TreeNode(null, null, root);
    b.title = "b";

    let b1 = new TreeNode(null, null, b);
    b1.title = "b1";

    root.children = [a, b];
    a.children = [a1, a2, a3];
    a2.children = [a2x];
    b.children = [b1];

    return root;
  }

  function runTest(startNode : TreeNode, results : string[], forward : boolean){
    let iterator = new TreeNodeIterator(startNode);
    let curNode : TreeNode;;
    let testNum = 1;

    do{
      if(forward){
        curNode = iterator.next();
      }
      else{
        curNode = iterator.previous();
      }

      if(curNode){
        expect(curNode.title).toEqual(results[testNum]);
      }
      else{
        expect(results[testNum]).toBeNull();
      }

      testNum++;
    }while(curNode && testNum < results.length);

    expect(testNum).toEqual(results.length);
  }

  function expandAllDescendants(node : TreeNode){
    node.isExpanded = true;

    node.children.forEach(c => {
      expandAllDescendants(c);
    });
  }

  function getLastDescendantNode(node : TreeNode){
    if(node.children.length > 0){
      return getLastDescendantNode(node.children[node.children.length - 1]);
    }
    else{
      return node;
    }
  }
});
