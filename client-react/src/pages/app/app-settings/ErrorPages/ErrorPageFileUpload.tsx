import React, { useContext, useRef } from 'react';
import { IconButton, Stack, StackItem, TextField } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import {
  uploadStyle,
  stackStyle,
  stackTokens,
  FabricFolder,
  browseButtonStyle,
  checkboxStyle,
  errorPageCheckboxStyles,
} from './ErrorPageGrid.styles';
import { ThemeContext } from '../../../../ThemeContext';
import InputLabel from '../../../../components/InputLabel/InputLabel';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { PortalContext } from '../../../../PortalContext';
import { ExperimentationConstants } from '../../../../utils/CommonConstants';

interface ErrorPageFileUploaderProps {
  setFileUploadSuccess: (upload: boolean) => void;
  setFile: (file: string) => void;
  fileUploadSuccess: boolean;
}

const extractErrorPageFromFile = (input): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader?.result ? reader.result.toString() : '');
    };
    reader.readAsText(input);
  });
};

const ErrorPageFileUploader: React.FC<ErrorPageFileUploaderProps> = (props: ErrorPageFileUploaderProps) => {
  const { setFileUploadSuccess, setFile, fileUploadSuccess } = props;
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();
  const uploadFileRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string>('');
  const [fileName, setFileName] = React.useState<string>('');
  const theme = useContext(ThemeContext);
  const fileType = 'text/html';

  const [customErrorFlighting, setCustomErrorFlighting] = React.useState(false);

  React.useEffect(() => {
    portalContext.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.customErrorAlwaysUse).then(setCustomErrorFlighting);
  }, [portalContext]);

  const onBrowseButtonClick = () => {
    if (uploadFileRef?.current) {
      uploadFileRef.current.click();
    }
  };

  const onGetErrorMessage = () => {
    if (!fileUploadSuccess) {
      return errorMsg;
    }
  };

  const uploadFile = React.useCallback(
    async event => {
      const file = event.target.files[0];
      setFileName(file.name);

      if (file.size > 10000 || !fileType.startsWith(fileType)) {
        setErrorMsg(t('error_uploadHTMLFile'));
        setFileUploadSuccess(false);
      } else {
        const encodedFile = btoa(await extractErrorPageFromFile(file));
        setFile(encodedFile);
        setFileUploadSuccess(true);
      }
    },
    [fileName]
  );

  return (
    <>
      <Text className={uploadStyle.labelHeader}>{t('errorPage')}</Text>
      <input ref={ref => (uploadFileRef.current = ref)} style={{ display: 'none' }} type="file" onChange={uploadFile} />
      <Stack horizontal className={stackStyle} tokens={stackTokens}>
        <StackItem grow={5}>
          <TextField
            id="fileLocationField"
            readOnly
            aria-required={true}
            value={fileName}
            placeholder={t('selectFile')}
            ariaLabel={t('selectFile')}
            onGetErrorMessage={onGetErrorMessage}
            onClick={onBrowseButtonClick}
          />
        </StackItem>
        <StackItem>
          <IconButton
            id="fileUploadBrowseButton"
            iconProps={FabricFolder}
            ariaLabel={t('browse')}
            onClick={onBrowseButtonClick}
            className={browseButtonStyle(theme)}
          />
        </StackItem>
      </Stack>
      {customErrorFlighting && (
        <Stack horizontal className={checkboxStyle} tokens={stackTokens}>
          <StackItem className={errorPageCheckboxStyles}>
            <InputLabel labelText={t('ErrorPagesAlwaysUse')} tooltipContent={t('ErrorPagesAlwaysUseTooltip')} tooltipId={'6'} />
          </StackItem>
          <StackItem>
            <Checkbox />
          </StackItem>
        </Stack>
      )}
    </>
  );
};

export default ErrorPageFileUploader;
