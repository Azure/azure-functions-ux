import React from 'react';
import { IDialogProps, Dialog, DialogFooter, PrimaryButton, DefaultButton, DialogType } from 'office-ui-fabric-react';
import { modalFooterStyles, modalContentStyles, modalStyles } from './ConfirmDialog.styles';

interface ConfirmDialogProps {
  primaryActionButton: { title: string; onClick: () => void };
  defaultActionButton: { title: string; onClick: () => void };
  title: string;
  content: string;
  modalStyles?: any;
  showCloseModal?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps & IDialogProps> = props => {
  const {
    primaryActionButton,
    defaultActionButton,
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
        <PrimaryButton onClick={primaryActionButton.onClick} text={primaryActionButton.title} />
        <DefaultButton onClick={defaultActionButton.onClick} text={defaultActionButton.title} />
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmDialog;
