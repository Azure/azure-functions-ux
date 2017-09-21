import { Component } from '@angular/core';

@Component({
    selector: 'button-example',
    styleUrls: ['./button-example.component.scss'],
    template: `
<section class="example">
    <h2>Buttons</h2>
    <div class="header">
        <label>EXAMPLE</label>
        <!-- Standard button -->
        <button class="custom-button">custom-button</button>

        <!-- Inverted button -->
        <button class="custom-button-invert">custom-button-invert</button>

        <!-- Standard disabled button -->
        <button class="custom-button" disabled>custom-button disabled</button>
    </div>
    <figure>
        <pre>

    &lt;!-- Standard button --&gt;
    &lt;button class=&quot;custom-button&quot;&gt;custom-button&lt;/button&gt;

    &lt;!-- Inverted button --&gt;
    &lt;button class=&quot;custom-button-invert&quot;&gt;custom-button-invert&lt;/button&gt;

    &lt;!-- Standard disabled button --&gt;
    &lt;button class=&quot;custom-button&quot; disabled&gt;custom-button disabled&lt;/button&gt;
        </pre>
    </figure>
</section>
    `
})
export class ButtonExampleComponent {
}
