import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { style } from 'typestyle';
import { FunctionTemplate } from '../../../../models/functions/function-template';

export const paddingStyle = {
  padding: '20px',
};

export const detailsPaddingStyle = {
  padding: '20px',
  paddingLeft: '8px',
};

export const filterBoxStyle = {
  root: {
    marginLeft: '0px',
    marginTop: '10px',
    height: '30px',
    width: '47%',
  },
};

export const getCardStyle = (theme: ThemeExtended) => {
  return style({
    border: `solid 1px ${theme.semanticColors.cardBorderColor}`,
    borderRadius: '2px',
    width: '47%',
    height: '150px',
    marginTop: '10px',
    marginRight: '12px',
    marginBottom: '5px',
    float: 'left',
    position: 'relative',

    $nest: {
      '&.selected': {
        borderColor: `${theme.semanticColors.inputBorder}`,
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.13)',
      },
      '&:hover': {
        cursor: 'pointer',
        boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.14)',
      },
      '&:focus': {
        outlineColor: `${theme.semanticColors.focusBorder}`,
        outlineOffset: '5px',
        outlineStyle: 'dashed',
        outlineWidth: '1px',
      },
    },
  });
};

export const getHeaderStyle = () => {
  return style({
    width: '24%',
    float: 'left',

    $nest: {
      img: {
        height: '26px',
        width: '26px',
        position: 'absolute',
        left: '26px',
        top: '15px',
      },
    },
  });
};

export const getSrc = (functionTemplate: FunctionTemplate) => {
  if (functionTemplate && functionTemplate.categoryStyle) {
    // TODO(allisonm): Reintroduce icons for blob, queue, and webhook (waiting on designer)
    switch (functionTemplate.categoryStyle) {
      // case 'blob':
      //   return require('images/CreateCardIcons/blob.svg');
      case 'cosmosDB':
        return require('images/CreateCardIcons/cosmosDB.svg');
      case 'eventGrid':
        return require('images/CreateCardIcons/eventGrid.svg');
      case 'eventHub':
        return require('images/CreateCardIcons/eventHub.svg');
      case 'http':
        return require('images/CreateCardIcons/http.svg');
      case 'iot':
        return require('images/CreateCardIcons/iot.svg');
      // case 'queue':
      //   return require('images/CreateCardIcons/queue.svg');
      case 'serviceBus':
        return require('images/CreateCardIcons/serviceBus.svg');
      case 'timer':
        return require('images/CreateCardIcons/timer.svg');
      // case 'webhook':
      //   return require('images/CreateCardIcons/webhook.svg');
    }
  }
  return require('images/CreateCardIcons/other.svg');
};

export const getDescriptionStyle = () => {
  return style({
    marginLeft: '24%',
    paddingRight: '15px',
    paddingTop: '15px',
  });
};

export const getTitleStyle = () => {
  return style({
    top: '17px',
    marginBottom: '8px',
    fontWeight: 'bold',
  });
};

export const getInfoStyle = () => {
  return style({
    position: 'relative',
    fontSize: '12px',
  });
};

export const getSelectStyle = () => {
  return style({
    position: 'absolute',
    fontSize: '12px',
    color: '#015CDA',
    bottom: '12px',
  });
};

export const extensionBundlesRequiredStyle = () => {
  return style({
    marginRight: '20px',
    marginTop: '200px',
    position: 'fixed',
    textAlign: 'center',
  });
};
