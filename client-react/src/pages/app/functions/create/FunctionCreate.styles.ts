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
    marginLeft: '410px',
    marginTop: '-10px',
    height: '30px',
    width: '300px',
  },
};

export const getCardStyle = (theme: ThemeExtended) => {
  return style({
    border: `solid 1px ${theme.semanticColors.cardBorderColor}`,
    borderRadius: '2px',
    width: '300px',
    height: '150px',
    marginTop: '10px',
    marginRight: '15px',
    marginBottom: '5px',
    float: 'left',
    position: 'relative',

    $nest: {
      '&.selected': {
        borderColor: `${theme.semanticColors.inputBorder}`,
      },
      '&:hover': {
        cursor: 'pointer',
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

export const getHeaderStyle = (functionTemplate: FunctionTemplate) => {
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
  if (functionTemplate.metadata && functionTemplate.metadata.categoryStyle) {
    // TODO(allisonm): Reintroduce icons for blob, queue, and webhook (waiting on designer)
    switch (functionTemplate.metadata.categoryStyle) {
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

export const getDescriptionStyle = (theme: ThemeExtended) => {
  return style({
    marginLeft: '24%',
    paddingRight: '15px',
    paddingTop: '15px',
  });
};

export const getTitleStyle = (theme: ThemeExtended) => {
  return style({
    top: '17px',
    marginBottom: '8px',
    fontWeight: 'bold',
  });
};

export const getInfoStyle = (theme: ThemeExtended) => {
  return style({
    position: 'relative',
    fontSize: '12px',
  });
};

export const getSelectStyle = (theme: ThemeExtended) => {
  return style({
    position: 'absolute',
    fontSize: '12px',
    color: '#015CDA',
    bottom: '18px',
  });
};
