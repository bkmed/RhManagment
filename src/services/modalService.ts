export interface ModalButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface ModalOptions {
  title: string;
  message?: string;
  buttons?: ModalButton[];
}

type ShowModalFn = (options: ModalOptions) => void;

let showModalHandler: ShowModalFn | null = null;

export const modalService = {
  setHandler: (handler: ShowModalFn) => {
    showModalHandler = handler;
  },
  show: (options: ModalOptions) => {
    if (showModalHandler) {
      showModalHandler(options);
    } else {
      // Fallback if modal not yet initialized
      console.warn('Modal handler not set. Falling back to console.');
      console.log(`MODAL [${options.title}]: ${options.message}`);
    }
  },
  showAlert: (title: string, message: string) => {
    modalService.show({ title, message });
  },
};
