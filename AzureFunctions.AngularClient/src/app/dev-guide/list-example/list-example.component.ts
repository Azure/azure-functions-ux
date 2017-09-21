import { Component } from '@angular/core';

@Component({
    selector: 'list-example',
    styleUrls: ['./list-example.component.scss'],
    template: `
<section class="example">
    <h2>Lists</h2>
    <h4>
        Adding a "list-item" or "list-item selected" class will give you common hover and selection coloring.  We could probably
        make the base styles for this more complex (like add padding, borders, etc...), but we'd have to
        update a lot of code that's currently using this class first.
    </h4>
    <div class="header">
        <label>EXAMPLE</label>
        <div>
            <div class="list-item">Item 1</div>
            <div class="list-item">Item 2</div>
            <div class="list-item">Item 3</div>
            <div class="list-item selected">Item 4 selected</div>
        </div>
    </div>
    <figure>
        <pre>

    &lt;div class=&quot;list-item&quot;&gt;Item 1&lt;/div&gt;
    &lt;div class=&quot;list-item&quot;&gt;Item 2&lt;/div&gt;
    &lt;div class=&quot;list-item&quot;&gt;Item 3&lt;/div&gt;
    &lt;div class=&quot;list-item selected&quot;&gt;Item 4 selected&lt;/div&gt;
    </pre>
    </figure>
</section>
    `
})
export class ListExampleComponent {
}
