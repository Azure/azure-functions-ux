import * as React from 'react';
import { Head as AzureHead } from './azure/Head';
import { Body as AzureBody } from './azure/Body';
import { Head as LocalHead } from './local/Head';
import { Body as LocalBody } from './local/Body';
import { HomeConfig } from 'src/types/config';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'app-root': any;
    }
  }
}

export const Home = (props: HomeConfig) => {
  return (
    <html lang="en">
      <head title="Azure Functions">
        <meta charSet="utf-8" name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.appsvc = ${JSON.stringify(props.config)}`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: inlineCSS,
          }}
        />
        {props.config.isAzure ? <AzureHead {...props} /> : <LocalHead {...props} />}
      </head>

      <body style={{ backgroundColor: 'inherit', margin: 0 }}>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `console.log("${props.config.version}")`,
          }}
        />
        <app-root>
          <div className="fxs-progress">
            <div className="fxs-progress-dots">
              <div />
              <div />
              <div />
            </div>
          </div>
        </app-root>
        {props.config.isAzure ? <AzureBody {...props} /> : <LocalBody {...props} />}
      </body>
    </html>
  );
};

const inlineCSS = `@-webkit-keyframes fxs-progress-animatedEllipses {
  0% {
      opacity: 1;
  }

  30% {
      opacity: .6;
  }

  60% {
      opacity: .3;
  }
}

@keyframes fxs-progress-animatedEllipses {
  0% {
      opacity: 1;
  }

  30% {
      opacity: .6;
  }

  60% {
      opacity: .3;
  }
}

.fxs-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #dcdfe2;
  background-color: rgba(255, 255, 255, 0.30);
  z-index: 196;
}

.fxs-progress-dots {
  position: absolute;
  top: calc(50% - 6px/2);
  width: 100%;
  line-height: 0;
  text-align: center;
}

  .fxs-progress-dots > div {
      display: inline-block;
      height: 12px;
      width: 12px;
      border-radius: 6px;
      opacity: .3;
      -webkit-animation: fxs-progress-animatedEllipses 1.8s infinite;
      animation: fxs-progress-animatedEllipses 1.8s infinite;
      background: #3471ff;
      margin: 0 3px;
  }

      .fxs-progress-dots > div:nth-child(1) {
          -webkit-animation-delay: 0s;
          animation-delay: 0s;
      }

      .fxs-progress-dots > div:nth-child(2) {
          -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s;
      }

      .fxs-progress-dots > div:nth-child(3) {
          -webkit-animation-delay: 0.4s;
          animation-delay: 0.4s;
      }

      .fxs-progress-dots > div:nth-child(4) {
          padding-top: 20px;
          width: 100%;
          background: white;
      }
`;
