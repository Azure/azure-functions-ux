import { Component } from '@angular/core';

@Component({
    selector: 'typography-example',
    styleUrls: ['./typography-example.component.scss'],
    template: `
<section id="typography-example" class="example">
    <h2>Typography</h2>
    <div class="header">
        <label>EXAMPLE</label>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <label>Label</label>
        <a>Link</a>
        Regular text
    </div>
    <figure>
        <pre>

    &lt;h1&gt;Heading 1&lt;/h1&gt;
    &lt;h2&gt;Heading 2&lt;/h2&gt;
    &lt;h3&gt;Heading 3&lt;/h3&gt;
    &lt;h4&gt;Heading 4&lt;/h4&gt;
    &lt;label&gt;Label&lt;/label&gt;
    &lt;a&gt;Link&lt;/a&gt;
    Regular text
    </pre>
    </figure>
</section>
    `
})
export class TypographyExampleComponent {
}
