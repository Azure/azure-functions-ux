import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { style } from 'typestyle';
import { FunctionTemplate } from '../../../../models/functions/function-template';

export const getCardStyle = (theme: ThemeExtended) => {
  return style({
    border: `solid 1px ${theme.semanticColors.cardBorderColor}`,
    borderRadius: '2px',
    width: '300px',
    height: '180px',
    margin: '35px',
    float: 'left',
    position: 'relative',
  });
};

export const getHeaderStyle = (theme: ThemeExtended, functionTemplate: FunctionTemplate) => {
  const headerStyle = _getTemplateColorandIcon(functionTemplate);
  return style({
    display: 'inline-flex',
    width: '100%',
    height: '41px',
    lineHeight: '37px',
    fontSize: '14px',
    fontWeight: '600',

    $nest: {
      img: {
        src: `${headerStyle.icon}`,
        backgroundColor: `${headerStyle.color}`,
        height: '40px',
        width: '40px',
        padding: '5px',
        marginRight: '15px',
      },
    },
  } as any);
};

export const getDescriptionStyle = (theme: ThemeExtended) => {
  return style({
    borderTop: `solid 1px ${theme.semanticColors.cardBorderColor}`,
    marginTop: '-5px',
    padding: '15px',
  });
};

const _getTemplateColorandIcon = (template: FunctionTemplate) => {
  if (template.metadata && template.metadata.categoryStyle) {
    return createCardStyles.hasOwnProperty(template.metadata.categoryStyle)
      ? createCardStyles[template.metadata.categoryStyle]
      : createCardStyles['other'];
  }
  return createCardStyles['other'];
};

const createCardStyles = {
  blob: { color: '#1E5890', icon: 'image/blob.svg' },
  cosmosDB: { color: '#379DA6', icon: 'image/cosmosDB.svg' },
  eventGrid: { color: '#719516', icon: 'image/eventGrid.svg' },
  eventHub: { color: '#719516', icon: 'image/eventHub.svg' },
  http: { color: '#731DDA', icon: 'image/http.svg' },
  iot: { color: '#990000', icon: 'image/iot.svg' },
  other: { color: '#000000', icon: 'image/other.svg' },
  queue: { color: '#1E5890', icon: 'image/queue.svg' },
  serviceBus: { color: '#F67600', icon: 'image/serviceBus.svg' },
  timer: { color: '#3C86FF', icon: 'image/timer.svg' },
  webhook: { color: '#731DDA', icon: 'image/webhook.svg' },
};
