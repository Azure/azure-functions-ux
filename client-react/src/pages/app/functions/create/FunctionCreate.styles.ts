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
    height: '180px',
    margin: '35px',
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
    display: 'inline-flex',
    width: '100%',
    height: '54px',
    lineHeight: '37px',
    fontSize: '14px',
    fontWeight: '600',

    $nest: {
      img: {
        backgroundColor: `${_getTemplateColor(functionTemplate)}`,
        height: '39px',
        width: '39px',
        padding: '5px',
        marginRight: '15px',
      },
    },
  } as any);
};

export const getSrc = (functionTemplate: FunctionTemplate) => {
  if (functionTemplate.metadata && functionTemplate.metadata.categoryStyle) {
    switch (functionTemplate.metadata.categoryStyle) {
      case 'blob':
        return require('images/CreateCardIcons/blob.svg');
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
      case 'queue':
        return require('images/CreateCardIcons/queue.svg');
      case 'serviceBus':
        return require('images/CreateCardIcons/serviceBus.svg');
      case 'timer':
        return require('images/CreateCardIcons/timer.svg');
      case 'webhook':
        return require('images/CreateCardIcons/webhook.svg');
    }
  }
  return require('images/CreateCardIcons/other.svg');
};

export const getDescriptionStyle = (theme: ThemeExtended) => {
  return style({
    borderTop: `solid 1px ${theme.semanticColors.cardBorderColor}`,
    marginTop: '-5px',
    padding: '15px',
  });
};

const _getTemplateColor = (template: FunctionTemplate) => {
  return (
    (template.metadata && template.metadata.categoryStyle && createCardColors[template.metadata.categoryStyle]) || createCardColors['other']
  );
};

// allisonm: Discuss with Byron regarding themeing these colors and light vs dark mode
const createCardColors = {
  blob: '#1E5890',
  cosmosDB: '#379DA6',
  eventGrid: '#719516',
  eventHub: '#719516',
  http: '#731DDA',
  iot: '#990000',
  other: '#000000',
  queue: '#1E5890',
  serviceBus: '#F67600',
  timer: '#3C86FF',
  webhook: '#731DDA',
};
