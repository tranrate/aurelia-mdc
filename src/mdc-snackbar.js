import {inject, bindable, bindingMode, TaskQueue} from 'aurelia-framework';
import {MDCSnackbarFoundation} from '@material/snackbar';
import {getCorrectEventName} from '@material/animation';

@inject(Element, TaskQueue)
export class MdcSnackbarCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) show;
  snackbarFoundation;
  myShow;

  constructor(Element, TaskQueue) {
    const TEXT = Element.querySelector(".mdc-snackbar__text");
    const ACTIONBUTTON = Element.querySelector(".mdc-snackbar__action-button");
    const TRANSITIONEND = getCorrectEventName(window, 'transitionend');

    const SNACKBAR = new MDCSnackbarFoundation({
      addClass: Element.classList.add.bind(Element.classList),
      removeClass: Element.classList.remove.bind(Element.classList),
      setAriaHidden: Element.setAttribute.bind(Element, 'aria-hidden', 'true'),
      unsetAriaHidden: Element.removeAttribute.bind(Element, 'aria-hidden'),
      setActionAriaHidden: ACTIONBUTTON.setAttribute.bind(ACTIONBUTTON, 'aria-hidden', 'true'),
      unsetActionAriaHidden: ACTIONBUTTON.removeAttribute.bind(ACTIONBUTTON, 'aria-hidden'),
      setActionText: (actionText) => {ACTIONBUTTON.textContent = actionText;},
      setMessageText: (message) => {TEXT.textContent = message;},
      registerActionClickHandler: ACTIONBUTTON.addEventListener.bind(ACTIONBUTTON, 'click'),
      deregisterActionClickHandler: ACTIONBUTTON.removeEventListener.bind(ACTIONBUTTON, 'click'),
      registerTransitionEndHandler: Element.addEventListener.bind(Element, TRANSITIONEND),
      deregisterTransitionEndHandler: Element.removeEventListener.bind(Element, TRANSITIONEND)
    });

    this.myShow = (params) => {TaskQueue.queueMicroTask(SNACKBAR.show.bind(SNACKBAR, params));};
    this.snackbarFoundation = SNACKBAR;
  };

  bind(context, extContext) {
    if (this.show) {context[this.show] = this.myShow;};
  };

  attached() {
    this.snackbarFoundation.init();
  };

  detached() {
    this.snackbarFoundation.destroy();
  };
};