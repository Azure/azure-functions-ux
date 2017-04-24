import { CustomFormControl } from './../controls/click-to-edit-textbox/click-to-edit-textbox.component';
import {FormControl} from '@angular/forms';

interface IValidation {
  [key: string]: string;
}

export class CustomValidators {

    static required(control : CustomFormControl) : IValidation{
        return (control.dirty || control._msRunValidation) && !control.value ? { "required" : "This field is required"} : null;
    }
  
//   static duplicated(control: Control) {
//     const q = new Promise<IValidation>((resolve, reject) => {
//       setTimeout(() => {
//         if(control.value === 'john.doe@gmail.com') {
//           resolve({'duplicated': true});
//         } else {
//           resolve(null);
//         }
//       }, 1000);
//     });
//     return q;
//   }
}