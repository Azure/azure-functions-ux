import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
export enum KeyCode {
    Tab = 9,
    Enter = 13,
    Esc = 27,
    Space = 32,
    ArrowUp = 38,
    ArrowDown = 40,
    Backspace = 8
}

export class NgSelectTestHelpers {
    public static selectOption(fixture, id: string, key: KeyCode, index: number) {
        NgSelectTestHelpers.triggerKeyDownEvent(NgSelectTestHelpers.getNgSelectElement(fixture, id), KeyCode.Space); // open
        for (let i = 0; i < index; i++) {
            NgSelectTestHelpers.triggerKeyDownEvent(NgSelectTestHelpers.getNgSelectElement(fixture, id), key);
        }
        NgSelectTestHelpers.triggerKeyDownEvent(NgSelectTestHelpers.getNgSelectElement(fixture, id), KeyCode.Enter); // select
    }

    public static getNgSelectElement(fixture: ComponentFixture<any>, id: string): DebugElement {
        return fixture.debugElement.query(By.css(`#${id}`));
    }

    public static triggerKeyDownEvent(element: DebugElement, key: number): void {
        element.triggerEventHandler('keydown', {
            which: key,
            preventDefault: () => { },
            stopPropagation: () => { }
        });
    }
}
