import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning';
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmColor = 'error',
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText || t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" autoFocus>
          {confirmText || t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
