// import { DefaultButton } from 'office-ui-fabric-react/lib-commonjs/Button';
// import * as React from 'react';
// import { translate } from 'react-i18next';
// import { style } from 'typestyle/lib';

// const footer = style({
//   borderTop: '1px solid rgba(0, 0, 0, .33)',
//   position: 'absolute',
//   bottom: '0',
//   height: '80px',
//   width: '100%',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'flex-end',
// });

// const button = style({
//   marginRight: '80px',
//   width: '100px',
//   height: '40px',
// });

// const ActionFooter = ({ submitForm, isSubmitting, isValid, isValidating, t }) => {
//   const text = () => {
//     if (isValidating) {
//       return t('validating');
//     }
//     if (isSubmitting) {
//       return t('submitting');
//     }
//     return t('create');
//   };
//   const submit = () => {
//     submitForm();
//   };
//   return (
//     <div className={footer}>
//       <DefaultButton
//         primary={true}
//         data-automation-id="create-button"
//         disabled={isSubmitting || isValidating}
//         checked={false}
//         text={text()}
//         className={button}
//         onClick={submit}
//         allowDisabledFocus={true}
//       />
//     </div>
//   );
// };

// export default translate('translation')(ActionFooter);
