export const paddingTopStyle = {
  paddingTop: '20px',
};

export const paddingSidesStyle = {
  paddingLeft: '8px',
  paddingRight: '8px',
};

export const linkPaddingStyle = {
  marginTop: '-10px',
  paddingBottom: '10px',
};

export const horizontalLinkPaddingStyle = (rightMargin: string = '245px', widthMin: string = '230px') => {
  return {
    marginTop: '-10px',
    textAlign: 'right',
    paddingBottom: '10px',
    marginRight: rightMargin,
    minWidth: widthMin,
  };
};

export const calloutStyleField = {
  padding: '16px 24px',
  minHeight: 175,
  width: 450,
};
