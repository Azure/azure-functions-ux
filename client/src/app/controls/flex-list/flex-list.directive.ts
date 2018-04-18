import { Output } from '@angular/core';
import { Directive, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { KeyCodes } from 'app/shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';
import { Subject } from 'rxjs/Subject';

@Directive({
    selector: '[flex-list]',
})
export class FlexListDirective implements AfterViewInit, OnDestroy {

    @Output() onEnterKeyPressed = new Subject<HTMLElement>();

    private _nativeElement: HTMLElement;
    private _observer: MutationObserver;

    constructor(elementRef: ElementRef) {
        this._nativeElement = elementRef.nativeElement;

        this._nativeElement.addEventListener('keydown', this._onKeyDown.bind(this), true);
        this._nativeElement.addEventListener('click', this._onClick.bind(this), true);

        this._observer = new MutationObserver(this._mutationCallback.bind(this));
        this._observer.observe(this._nativeElement, { childList: true });
    }

    ngAfterViewInit() {
        this._initFirstChildAsFocusable();
    }

    ngOnDestroy() {
        this._nativeElement.removeEventListener('keydown', this._onKeyDown.bind(this), true);
        this._nativeElement.removeEventListener('click', this._onClick.bind(this), true);
        this._observer.disconnect();
    }

    // If the list of children change dynamically, we need to handle initializing at least
    // one child to be focusable.
    private _mutationCallback(mutationsList: MutationEvent[]) {
        const updateMutation = mutationsList.find(m => m.type === 'childList');
        if (updateMutation) {
            let existingFocusableChild = false;
            for (let i = 0; i < this._nativeElement.children.length; i++) {
                if ((<HTMLElement>this._nativeElement.children[i]).tabIndex > -1) {
                    existingFocusableChild = true;
                    break;
                }
            }

            if (!existingFocusableChild) {
                this._initFirstChildAsFocusable();
            }
        }
    }

    private _initFirstChildAsFocusable() {
        if (this._nativeElement.children.length > 0) {
            (<HTMLElement>this._nativeElement.children[0]).tabIndex = 0;
        }
    }

    private _onClick(event: MouseEvent) {
        const child = this._findFlexItemElement(event.srcElement);
        if (child) {
            // Reset all focusable elements
            for (let i = 0; i < this._nativeElement.children.length; i++) {
                (<HTMLElement>this._nativeElement.children[i]).tabIndex = -1;
            }

            (<HTMLElement>child).tabIndex = 0;
        }
    }

    private _findFlexItemElement(element: Element) {
        do {
            if (element.parentElement === this._nativeElement) {
                return element;
            }

            element = element.parentElement;
        } while (element.parentElement !== document.documentElement);

        return null;
    }

    private _onKeyDown(event: KeyboardEvent) {
        if (event.keyCode !== KeyCodes.arrowDown
            && event.keyCode !== KeyCodes.arrowUp
            && event.keyCode !== KeyCodes.arrowLeft
            && event.keyCode !== KeyCodes.arrowRight
            && event.keyCode !== KeyCodes.enter) {

            return;
        }

        const children = this._nativeElement.children;
        let focusedIndex = this._getFocusedChildIndex();
        if (focusedIndex < 0) {
            this._initFirstChildAsFocusable();
            return;
        }

        if (event.keyCode === KeyCodes.enter) {
            this.onEnterKeyPressed.next(<HTMLElement>event.srcElement);

        } else if (event.keyCode === KeyCodes.arrowDown) {
            const nextIndex = this._findNextVerticleChildDown(children, focusedIndex);
            this._clearFocusOnItem(children[focusedIndex]);
            this._setFocusOnChild(children, nextIndex);
            this._scrollIntoView(children[nextIndex]);
        } else if (event.keyCode === KeyCodes.arrowUp) {
            const nextIndex = this._findNextVerticleChildUp(children, focusedIndex);
            this._clearFocusOnItem(children[focusedIndex]);
            this._setFocusOnChild(children, nextIndex);
            this._scrollIntoView(children[nextIndex]);
        } else if (event.keyCode === KeyCodes.arrowLeft) {
            this._clearFocusOnItem(children[focusedIndex]);
            focusedIndex = this._setFocusOnChild(children, focusedIndex - 1);
            this._scrollIntoView(children[focusedIndex]);
        } else if (event.keyCode === KeyCodes.arrowRight) {
            this._clearFocusOnItem(children[focusedIndex]);
            focusedIndex = this._setFocusOnChild(children, focusedIndex + 1);
            this._scrollIntoView(children[focusedIndex]);
        }

        event.preventDefault();
    }

    private _findNextVerticleChildDown(children: HTMLCollection, index: number) {
        // Flexbox can have various arrangements of children that make for some edge cases in using the down arrow key

        // This difficulty does not exist with less than 7 children because we are gaurenteed that the child to go
        // down to is within a child's width (curChild.clientWidth) of the current child or that there is only one child below

        //      [1]     |      [1] [2]     |    [1] [2] [3]    |   [1] [2] [3] [4]
        //      [2]     |      [3] [4]     |      [4] [5]      |         [5]
        //      [3]     |        [5]       |                   |
        //      [4]     |                  |                   |
        //      [5]     |                  |                   |

        // ----------------------------------------------------------------------------------------------

        //     [1] [2]  |    [1] [2] [3] [4] [5]    |  [1] [2] [3] [4]      |   [1] [2] [3] [4] [5] [6]
        //     [3] [4]  |            [6]            |      [5] [6]          |
        //     [5] [6]  |                           |                       |


        // However with 7 children we reach the 'base case' of difficulty:
        // We need logic that ensures children map to the closest below them when there are multiple options
        // on the row below them and none of them are within the the child's width (curChild.clientWidth) of their position

        //     [1] [2] [3] [4] [5]   |   [1] [2] [3] [4] [5] [6]   |   [1] [2] [3] [4] [5]    |   ETC....
        //           [6] [7]         |           [7] [8]           |       [6] [7] [8]        |

        let nextRowPosition = 0;
        let foundNextRowPosition = false;
        let closestchildIndex = index;
        let closestchildDistance = 0;

        const curChild = <HTMLElement>children[index];
        const curChildPosition = Dom.getElementCoordinates(curChild);

        for (let i = index + 1; i < children.length; i++) {
            const nextchildPosition = Dom.getElementCoordinates(<HTMLElement>children[i]);
            if (!foundNextRowPosition && nextchildPosition.top > curChildPosition.top) {
                nextRowPosition = nextchildPosition.top;
                foundNextRowPosition = true;
                closestchildIndex = i;
                closestchildDistance = Math.abs(curChildPosition.left - nextchildPosition.left);
                if (closestchildDistance < curChild.clientWidth) {
                    return closestchildIndex;
                }
                continue;
            }
            if (foundNextRowPosition) {
                if (nextchildPosition.top === nextRowPosition && Math.abs(curChildPosition.left - nextchildPosition.left) < closestchildDistance) {
                    closestchildDistance = Math.abs(curChildPosition.left - nextchildPosition.left);
                    closestchildIndex = i;
                    if (closestchildDistance < curChild.clientWidth) {
                        return closestchildIndex;
                    }
                } else {
                    return closestchildIndex;
                }
            }
        }

        // If you don't find the position of the next row it means the current child is on the bottom row
        if (!foundNextRowPosition) {
            for (let i = 0; i < index; i++) {
                const nextchildPosition = Dom.getElementCoordinates(<HTMLElement>children[i]);
                if (nextchildPosition.top <= curChildPosition.top && Math.abs(nextchildPosition.left - curChildPosition.left) < curChild.clientWidth) {
                    closestchildIndex = i;
                    return closestchildIndex;
                }
            }
        }

        return closestchildIndex;
    }

    private _findNextVerticleChildUp(children: HTMLCollection, index: number) {
        // Up arrow is much easier for Flexbox
        // The row above always has more than or equal to the number of boxes of the current row
        // This means there is a child above the current child that will be within its width (curChild.clientWidth)

        // However, since the up arrow should be able to wrap around, the top row will map to the bottom
        // In this case the logic is the same as arrow down from the n-1th row to the nth row (where n = total # of rows)

        let nextRowPosition = 0;
        let foundNextRowPosition = false;
        let closestchildIndex = index;
        let closestchildDistance = 0;

        const curChild = <HTMLElement>children[index];
        const currentchildPosition = Dom.getElementCoordinates(curChild);

        for (let i = index - 1; i >= 0; i--) {
            const nextchildPosition = Dom.getElementCoordinates(<HTMLElement>children[i]);
            if (nextchildPosition.top <= currentchildPosition.top && Math.abs(nextchildPosition.left - currentchildPosition.left) < curChild.clientWidth) {
                closestchildIndex = i;
                return closestchildIndex;
            }
        }

        // If you don't find the position of the next row it means the current child is on the top row
        for (let i = children.length - 1; i > index; i--) {
            const nextchildPosition = Dom.getElementCoordinates(<HTMLElement>children[i]);
            if (!foundNextRowPosition && nextchildPosition.top > currentchildPosition.top) {
                nextRowPosition = nextchildPosition.top;
                foundNextRowPosition = true;
                closestchildIndex = i;
                closestchildDistance = Math.abs(currentchildPosition.left - nextchildPosition.left);
                if (closestchildDistance < curChild.clientWidth) {
                    return closestchildIndex;
                }
                continue;
            }
            if (foundNextRowPosition) {
                if (nextchildPosition.top === nextRowPosition && Math.abs(currentchildPosition.left - nextchildPosition.left) < closestchildDistance) {
                    closestchildDistance = Math.abs(currentchildPosition.left - nextchildPosition.left);
                    closestchildIndex = i;
                    if (closestchildDistance < curChild.clientWidth) {
                        return closestchildIndex;
                    }
                } else {
                    return closestchildDistance;
                }
            }
        }

        return closestchildIndex;
    }

    private _getFocusedChildIndex() {
        const children = this._nativeElement.children;
        for (let i = 0; i < children.length; i++) {
            if ((<HTMLElement>children[i]).tabIndex >= 0) {
                return i;
            }
        }

        return -1;
    }

    private _clearFocusOnItem(item: Element) {
        Dom.clearFocus(<HTMLElement>item);
    }

    private _setFocusOnChild(children: HTMLCollection, targetIndex: number) {

        if (children.length === 0) {
            targetIndex = -1;
        } else if (targetIndex < 0) {
            targetIndex = children.length - 1;
        } else if (targetIndex >= children.length) {
            targetIndex = 0;
        }

        if (targetIndex > -1) {
            Dom.setFocus(<HTMLElement>children[targetIndex]);
        }

        return targetIndex;
    }

    private _scrollIntoView(elem: Element) {
        Dom.scrollIntoView(<HTMLElement>elem, window.document.body);
    }
}
