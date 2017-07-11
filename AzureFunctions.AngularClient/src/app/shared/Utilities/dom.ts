
export class Dom {
    public static setFocus(element: HTMLElement){
        element.classList.add('focused');
    }

    public static clearFocus(element: HTMLElement){
        element.classList.remove('focused');
    }

    // This isn't comprehensive but is good enough for our current scenarios.  To get more context, checkout these links:
    // https://stackoverflow.com/questions/7208161/focus-next-element-in-tab-index
    // https://stackoverflow.com/questions/7668525/is-there-a-jquery-selector-to-get-all-elements-that-can-get-focus
    public static getTabbableControl(element: HTMLElement): HTMLElement {

        const controls = element.querySelectorAll('input, select, textarea, button, object, a, area, .link, div.sortable');
        if (controls.length === 0) {
            return element;
        } else {
            return <HTMLElement>controls[0];
        }
    }
}