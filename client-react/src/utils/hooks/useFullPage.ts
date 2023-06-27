import { useWindowSize } from 'react-use';

export const useFullPage = () => {
  const { width, height } = useWindowSize();
  const fullpageElement = width > 750; // Max element width
  const fullpageElementWithLabel = width > 550; // Max element with label width
  return { width, height, fullpageElement, fullpageElementWithLabel };
};
