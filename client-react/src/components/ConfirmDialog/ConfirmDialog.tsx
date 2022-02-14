import { DefaultButton, Dialog, DialogFooter, DialogType, IDialogProps, PrimaryButton } from '@fluentui/react';
import React from 'react';
import { modalFooterStyles, modalContentStyles, modalStyles } from './ConfirmDialog.styles';

interface ConfirmDialogProps {
  primaryActionButton: { title: string; onClick: () => void; disabled?: boolean };
  defaultActionButton: { title: string; onClick: () => void; disabled?: boolean };
  hideDefaultActionButton?: boolean;
  title: string;
  content: string;
  modalStyles?: any;
  showCloseModal?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps & IDialogProps> = props => {
  const {
    primaryActionButton,
    defaultActionButton,
    hideDefaultActionButton,
    hidden,
    title,
    content,
    onDismiss,
    showCloseModal,
    modalStyles: customModalStyles,
  } = props;

  return (
    <Dialog
      hidden={hidden}
      dialogContentProps={{
        type: showCloseModal === undefined || showCloseModal ? DialogType.close : DialogType.normal,
        styles: modalContentStyles,
      }}
      modalProps={{
        styles: !!customModalStyles ? customModalStyles : modalStyles,
        isBlocking: true,
      }}
      onDismiss={onDismiss}>
      <div>
        <h3>{title}</h3>
        <p>{content}</p>
      </div>
      <DialogFooter styles={modalFooterStyles}>
        <PrimaryButton onClick={primaryActionButton.onClick} text={primaryActionButton.title} disabled={primaryActionButton.disabled} />
        {!hideDefaultActionButton ? (
          <DefaultButton onClick={defaultActionButton.onClick} text={defaultActionButton.title} disabled={defaultActionButton.disabled} />
        ) : (
          <></>
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmDialog;
