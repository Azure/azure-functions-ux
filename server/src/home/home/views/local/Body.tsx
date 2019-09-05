import * as React from 'react';
export const Body = props => {
  return (
    <>
      <script src="inline.bundle.js" />
      <script src="polyfills.bundle.js" />
      <script src="scripts.bundle.js" />
      <script src="vendor.bundle.js" />
      <script src="main.bundle.js" />
      <script src="styles.bundle.js" />
      <script src="assets/monaco/min/vs/loader.js" />
    </>
  );
};
