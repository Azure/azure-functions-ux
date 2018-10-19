// import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib-commonjs/Dropdown';
// import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
// import * as React from 'react';
// import { translate } from 'react-i18next';
// import { connect } from 'react-redux';
// import { compose } from 'recompose';
// import { style } from 'typestyle/lib';
// const headerFormClass = style({
//   borderBottom: '1px solid rgba(0,0,0,.33)',
//   height: '100px',
//   width: '100%',
//   display: 'inline-flex',
//   alignItems: 'center',
//   justifyContent: 'center',
// });

// const textFieldClass = style({
//   marginRight: '50px',
//   marginLeft: '50px',
//   width: '500px',
// });

// const dropDownClass = style({
//   width: '200px',
// });

// const HeaderForm = ({ formValues, formErrors, touched, handleChange, handleBlur, onLanguageChange, isSubmitting, t }) => {
//   const textChanged = newVal => {
//     formValues.functionAppName = newVal;
//     handleChange(newVal);
//   };
//   const onLangChanged = (evt: IDropdownOption) => {
//     onLanguageChange(evt.key.toString(), evt.key.toString() === 'csharp' ? cSharpCode : javascriptCode);
//   };
//   return (
//     <div className={headerFormClass}>
//       <TextField
//         className={textFieldClass}
//         suffix=".azurewebsites.net"
//         label={t('functionAppName')}
//         value={formValues.functionAppName}
//         required={true}
//         onChanged={textChanged}
//         onBlur={handleBlur}
//         errorMessage={formErrors.functionAppName}
//       />
//       <div>
//         <Dropdown
//           placeholder="Select Language"
//           className={dropDownClass}
//           label={t('templatePicker_language')}
//           id="languageDropdown"
//           defaultSelectedKey={formValues.functionAppLanguage}
//           ariaLabel={t('languageAria')}
//           options={[{ key: 'csharp', text: 'C#' }, { key: 'javascript', text: 'Javascript' }]}
//           onChanged={onLangChanged}
//         />
//       </div>
//     </div>
//   );
// };

// const mapStateToProps = state => {
//   return {
//     theme: state.portalService && state.portalService.startupInfo && state.portalService.startupInfo.theme,
//   };
// };
// export default compose<any, any>(
//   connect(mapStateToProps),
//   translate(),
// )(HeaderForm);

// const javascriptCode = `module.exports = function (context, req) {
//     context.log('JavaScript HTTP trigger function processed a request.');

//     if (req.query.name || (req.body && req.body.name)) {
//         context.res = {
//             // status: 200, /* Defaults to 200 */
//             body: "Hello " + (req.query.name || req.body.name)
//         };
//     }
//     else {
//         context.res = {
//             status: 400,
//             body: "Please pass a name on the query string or in the request body"
//         };
//     }
//     context.done();
// };
//       `;

// export const cSharpCode = `using System.Net;

// public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
// {
//     log.Info("C# HTTP trigger function processed a request.");

//     // parse query parameter
//     string name = req.GetQueryNameValuePairs()
//         .FirstOrDefault(q => string.Compare(q.Key, "name", true) == 0)
//         .Value;

//     if (name == null)
//     {
//         // Get request body
//         dynamic data = await req.Content.ReadAsAsync<object>();
//         name = data?.name;
//     }

//     return name == null
//         ? req.CreateResponse(HttpStatusCode.BadRequest, "Please pass a name on the query string or in the request body")
//         : req.CreateResponse(HttpStatusCode.OK, "Hello " + name);
// }
// `;
