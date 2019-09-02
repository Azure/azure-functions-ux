import * as React from 'react';

export const Body = props => {
  let Scripts = () => (
    <>
      <script src={props.versionConfig.inline} />
      <script src={props.versionConfig.polyfills} />
      <script src={props.versionConfig.scripts} />
      <script src={props.versionConfig.main} />
    </>
  );
  if (props.clientOptimizationsOff || !props.versionConfig) {
    Scripts = () => (
      <>
        <script src="inline.bundle.js" />
        <script src="polyfills.bundle.js" />
        <script src="scripts.bundle.js" />
        <script src="vendor.bundle.js" />
        <script src="main.bundle.js" />
        <script src="styles.bundle.js" />
      </>
    );
  }
  return (
    <>
      <Scripts />
      {!!process.env.aiInstrumentationKey && (
        <>
          <script src="https://az416426.vo.msecnd.net/scripts/a/ai.0.js" />
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `var appInsights = window.appInsights || function (config) { function r(config) { t[config] = function () { var i = arguments; t.queue.push(function () { t[config].apply(t, i) }) } } var t = { config: config }, u = document, e = window, o = "script", s = u.createElement(o), i, f; s.src = config.url || "https://az416426.vo.msecnd.net/scripts/a/ai.0.js"; u.getElementsByTagName(o)[0].parentNode.appendChild(s); try { t.cookie = u.cookie } catch (h) { } for (t.queue = [], i = ["Event", "Exception", "Metric", "PageView", "Trace", "Dependency"]; i.length;) r("track" + i.pop()); return r("setAuthenticatedUserContext"), r("clearAuthenticatedUserContext"), config.disableExceptionTracking || (i = "onerror", r("_" + i), f = e[i], e[i] = function (config, r, u, e, o) { var s = f && f(config, r, u, e, o); return s !== !0 && t["_" + i](config, r, u, e, o), s }), t }({ instrumentationKey: "${
                process.env.aiInstrumentationKey
              }" }); window.appInsights = appInsights; appInsights.trackPageView() ;`,
            }}
          />
        </>
      )}
    </>
  );
};
