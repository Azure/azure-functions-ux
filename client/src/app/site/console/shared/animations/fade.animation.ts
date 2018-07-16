import {trigger, transition, state, animate, style} from '@angular/animations';

export let fade  = trigger('fade', [
    state('void', style({opacity: 0})),

    transition(':enter, :leave', [
        animate(500)
    ])
]);