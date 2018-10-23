// import { Formik } from 'formik';
// import * as React from 'react';
// import { translate } from 'react-i18next';
// import { connect } from 'react-redux';
// import { compose } from 'recompose';
// import { updateFunctionAppLanguageAndCode, updateFunctionAppName, updateIsSubmitting } from '../../../modules/app/function-quick-create/actions';
// import { handleFormSubmission } from '../../../modules/app/function-quick-create/thunks';
// import ActionFooter from './components/action-footer';
// import Editor from './components/editor';
// import HeaderForm from './components/header-form';
// import axios from 'axios';

// class FunctionQuickCreate extends React.Component<any, any> {
//   public render() {
//     return (
//       <Formik
//         initialValues={{
//           functionAppName: this.props.functionAppName,
//           functionAppLanguage: this.props.functionAppLanguage,
//         }}
//         validate={async values => {
//           const AppNameValidationResult = await axios.post(
//             'https://management.azure.com/subscriptions/bec500d9-00be-46e0-93ae-502e66b9c85d/providers/Microsoft.Web/checknameavailability?api-version=2016-03-01',
//             {
//               headers: {
//                 Authorization: `Bearer ${this.props.adToken}`,
//                 'content-type': 'application/json',
//               },
//               body: JSON.stringify({
//                 isFQDN: false,
//                 name: values.functionAppName,
//                 type: 'Site',
//               }),
//             },
//           );

//           const resultJson = AppNameValidationResult.data;
//           // same as above, but feel free to move this into a class method now.
//           const errors: any = {};
//           if (!values.functionAppName) {
//             errors.functionAppName = this.props.t('functionNew_functionNameRequired');
//           } else if (!resultJson.nameAvailable) {
//             errors.functionAppName = resultJson.message;
//           }
//           if (Object.keys(errors).length) {
//             throw errors;
//           }
//         }}
//         onSubmit={(values, { setSubmitting, setErrors }) => {
//           this.props.SubmitForm(values);
//         }}
//         render={({ values, errors, touched, handleChange, handleBlur, submitForm, isValidating, isValid }) => (
//           <div>
//             <HeaderForm
//               formValues={values}
//               formErrors={errors}
//               touched={touched}
//               handleChange={handleChange}
//               handleBlur={handleBlur}
//               isSubmitting={this.props.isSubmitting}
//               onLanguageChange={this.props.UpdateFunctionAppLanguageAndCode}
//             />
//             <Editor />
//             <ActionFooter submitForm={submitForm} isSubmitting={this.props.isSubmitting} isValid={isValid} isValidating={isValidating} />
//           </div>
//         )}
//       />
//     );
//   }
// }

// const mapStateToProps = state => {
//   return {
//     functionAppName: state.functionQuickCreate.functionAppName,
//     functionAppLanguage: state.functionQuickCreate.functionAppLanguage,
//     theme: state.portalService && state.portalService.startupInfo && state.portalService.startupInfo.theme,
//     adToken: state.portalService && state.portalService.startupInfo && state.portalService.startupInfo.token,
//     isSubmitting: state.functionQuickCreate.isSubmitting,
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     UpdateFunctionAppName: (appName: string) => dispatch(updateFunctionAppName(appName)),
//     UpdateFunctionAppLanguageAndCode: (language: string, code: string) => dispatch(updateFunctionAppLanguageAndCode(language, code)),
//     UpdateIsSubmitting: (isSubmitting: boolean) => dispatch(updateIsSubmitting(isSubmitting)),
//     SubmitForm: values => dispatch(handleFormSubmission(values)),
//   };
// };
// export default compose(
//   connect(
//     mapStateToProps,
//     mapDispatchToProps,
//   ),
//   translate('translation'),
// )(FunctionQuickCreate);
