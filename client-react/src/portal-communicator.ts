import { loadTheme } from 'office-ui-fabric-react/lib-commonjs/Styling';
import { IEvent, IStartupInfo, Verbs } from './models/portal-models';
import { getStartupInfoAction, setupIFrameAction, updateTheme } from './modules/portal/portal-service-actions';
import { store } from './store';
import i18n from './utils/i18n';
import { Url } from './utils/url';
import darkModeTheme from './theme/dark';
import lightTheme from './theme/light';
export class PortalCommunicator {
  public static currentTheme = 'lightTheme';
  public static initializeIframe(): void {
    window.addEventListener(Verbs.message, this.iframeReceivedMsg.bind(this), false);
    const shellUrl = decodeURI(window.location.href);
    const shellSrc = Url.getParameterByName(shellUrl, 'trustedAuthority') || '';
    store.dispatch(setupIFrameAction(shellSrc));
    if (shellSrc) {
      const getStartupInfoObj = {
        iframeHostName: null,
      };
      // This is a required message. It tells the shell that your iframe is ready to receive messages.
      this.postMessage(Verbs.ready, null);
      this.postMessage(Verbs.getStartupInfo, JSON.stringify(getStartupInfoObj));
    }
  }

  public static postMessage(verb: string, data: string | null) {
    const shellSrc = store.getState().portalService.shellSrc;
    if (Url.getParameterByName(null, 'appsvc.bladetype') === 'appblade') {
      window.parent.postMessage(
        {
          data,
          kind: verb,
          signature: this.portalSignature,
        },
        shellSrc
      );
    } else {
      window.parent.postMessage(
        {
          data,
          kind: verb,
          signature: this.portalSignatureFrameBlade,
        },
        shellSrc
      );
    }
  }

  private static portalSignature = 'FxAppBlade';
  private static portalSignatureFrameBlade = 'FxFrameBlade';

  private static iframeReceivedMsg(event: IEvent): void {
    if (!event || !event.data) {
      return;
    }
    const data = event.data.data;
    const methodName = event.data.kind;

    // tslint:disable-next-line:no-console
    // tslint:disable-next-line:prefer-template
    console.log('[iFrame] Received mesg: ' + methodName);

    if (methodName === Verbs.sendStartupInfo) {
      const startupInfo = data as IStartupInfo;
      if (this.currentTheme !== startupInfo.theme) {
        const newTheme = startupInfo.theme === 'dark' ? darkModeTheme : lightTheme;
        loadTheme(newTheme);
        store.dispatch(updateTheme(newTheme as any));
        this.currentTheme = startupInfo.theme;
      }
      i18n.changeLanguage(startupInfo.acceptLanguage);
      store.dispatch(getStartupInfoAction(startupInfo));
    }
  }
}
