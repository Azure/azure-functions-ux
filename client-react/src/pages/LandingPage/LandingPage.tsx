import * as React from 'react';
import { style } from 'typestyle';
import { RouteComponentProps } from '@reach/router';
import ReactSVG from 'react-svg';

const divStyle = style({
  backgroundColor: '#babcbe',
  width: '100vw',
  height: '100vh',
});
const errorPage = style({
  position: 'relative',
  display: 'block',
  fontFamily: 'az_ea_font,"Segoe UI",wf_segoe-ui_normal,"Segoe WP",Tahoma,Arial,sans-serif',
  color: 'white',
  backgroundColor: '#babcbe',
});

const errorPageContent = style({
  margin: '110px 0 0 80px',
  position: 'absolute',
  width: '310px',
  display: 'block',
  backgroundColor: '#babcbe',
});

const h1style = style({
  fontFamily: 'az_ea_font,"Segoe UI",wf_segoe-ui_normal,"Segoe WP",Tahoma,Arial,sans-serif',
  fontSize: '48px',
  lineHeight: '48px',
  fontWeight: 'normal',
  color: 'white',
  margin: '0',
  marginBottom: '13px',
  display: 'block',
  backgroundColor: '#babcbe',
});

const errorPageHelp = style({
  fontFamily: 'az_ea_font,"Segoe UI",wf_segoe-ui_normal,"Segoe WP",Tahoma,Arial,sans-serif',
  fontWeight: 400,
  fontSize: '18px',
  marginBottom: '50px',
});

const cloud1 = style({
  position: 'absolute',
  top: '160px',
  left: '480px',
  width: '200px',
});
const cloud2 = style({
  position: 'absolute',
  top: '400px',
  left: '240px',
  width: '140px',
});

const cloud3 = style({
  position: 'absolute',
  top: '600px',
  left: '960px',
  width: '100px',
});
const LandingPage: React.SFC<RouteComponentProps<any>> = props => {
  return (
    <div className={divStyle}>
      <div className={errorPage}>
        <div className={errorPageContent}>
          <h1 className={h1style}>Extensions run in the portal</h1>
          <div className={errorPageHelp}>This URI is intended to be loaded as an iFrame by the Portal Framework.</div>
        </div>
        <ReactSVG className={cloud1} src="images/cloud_drop.svg" />
        <ReactSVG className={cloud2} src="images/cloud_drop.svg" />
        <ReactSVG className={cloud3} src="images/cloud_drop.svg" />
      </div>
    </div>
  );
};

export default LandingPage;
