import {trigger, transition, state, animate, style} from '@angular/animations';

export let slideUpDown  = trigger('slideUpDown', [
    state('void', style({transform: 'translateY(100%)'})),
    transition(':enter',[
        animate('200ms', style({transform: 'translateY(0)'}))
    ]),
    transition(':leave', [
        animate('200ms')
    ])
]);