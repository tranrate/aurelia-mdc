import {inject, bindable, bindingMode, TaskQueue, DOM} from 'aurelia-framework';
import {MDCDialogFoundation} from '@material/dialog';
import {getCorrectEventName} from '@material/animation';
import {MDCRippleFoundation} from '@material/ripple';

@inject(Element, TaskQueue)
export class MdcDialogCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) open;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) show;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) close;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) accept;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) cancel;

  callbacks = {};

  constructor(Element, TaskQueue) {
    const DIALOGSURFACE = Element.querySelector(MDCDialogFoundation.strings.DIALOG_SURFACE_SELECTOR);
    const ACCEPTBUTTON = Element.querySelector(MDCDialogFoundation.strings.ACCEPT_SELECTOR);
    const {FOCUSABLE_ELEMENTS} = MDCDialogFoundation.strings;
    const FOCUSABLETARGETS = DIALOGSURFACE.querySelectorAll(FOCUSABLE_ELEMENTS);
    const PASSIVE = this.applyPassive();
    const TRANSITIONEND = getCorrectEventName(window, 'animation');
    const TAB_DATA = 'data-mdc-tabindex';
    const TAB_DATA_HANDLED = 'data-mdc-tabindex-handled';
    const BROWSERSUPPORTSCSSVARS = this.browserSupportsCssVars();
    const CALLBACKS = this.callbacks;

    let btnRipples = [];

    const DIALOG =  new MDCDialogFoundation({
      hasClass: Element.classList.contains.bind(Element.classList),
      addClass: Element.classList.add.bind(Element.classList),
      removeClass: Element.classList.remove.bind(Element.classList),
      setAttr: Element.setAttribute.bind(Element),
      addBodyClass: document.body.classList.add.bind(document.body.classList),
      removeBodyClass: document.body.classList.remove.bind(document.body.classList),
      eventTargetHasClass: (target, className) => {return target.classList.contains(className);},
      registerInteractionHandler: (evt, handler) => {Element.addEventListener(evt, handler, PASSIVE);},
      deregisterInteractionHandler: (evt, handler) => {Element.removeEventListener(evt, handler, PASSIVE);},
      registerSurfaceInteractionHandler: DIALOGSURFACE.addEventListener.bind(DIALOGSURFACE),
      deregisterSurfaceInteractionHandler: DIALOGSURFACE.removeEventListener.bind(DIALOGSURFACE),
      registerDocumentKeydownHandler: document.addEventListener.bind(document, 'keydown'),
      deregisterDocumentKeydownHandler: document.removeEventListener.bind(document,'keydown'),
      registerFocusTrappingHandler: (handler) => {document.addEventListener('focus', handler, true);},
      deregisterFocusTrappingHandler: (handler) => {document.removeEventListener('focus', handler, true);},
      numFocusableTargets: () => {return FOCUSABLETARGETS.length;},
      setDialogFocusFirstTarget: () => {return FOCUSABLETARGETS[0].focus();},
      setInitialFocus: () => {ACCEPTBUTTON.focus();},
      getFocusableElements: () => {return FOCUSABLETARGETS;},
      saveElementTabState: (el) => {
        if (el.hasAttribute('tabindex')) {
          el.setAttribute(TAB_DATA, el.getAttribute('tabindex'));
        }
        el.setAttribute(TAB_DATA_HANDLED, true);
      },
      restoreElementTabState: (el) => {
        if (el.hasAttribute(TAB_DATA_HANDLED)) {
          if (el.hasAttribute(TAB_DATA)) {
            el.setAttribute('tabindex', el.getAttribute(TAB_DATA));
            el.removeAttribute(TAB_DATA);
          } else {
            el.removeAttribute('tabindex');
          }
          el.removeAttribute(TAB_DATA_HANDLED);
        };
      },
      makeElementUntabbable: (el) => {el.setAttribute('tabindex', -1);},
      setBodyAttr: document.body.setAttribute.bind(document.body),
      rmBodyAttr: document.body.removeAttribute.bind(document.body),
      getFocusedTarget: () => { return DOM.activeElement;},
      setFocusedTarget: (target) => {target.focus();},
      notifyAccept: () => {
        TaskQueue.queueMicroTask(CALLBACKS.accept);
        btnRipples.forEach((ripple) => ripple.destroy());
      },
      notifyCancel: () => {
        TaskQueue.queueMicroTask(CALLBACKS.cancel);
        btnRipples.forEach((ripple) => ripple.destroy());
      }
    });

    Element.querySelectorAll('.mdc-dialog__footer__button').forEach((button) => {
      btnRipples.push(new MDCRippleFoundation({
        browserSupportsCssVars: () => {return BROWSERSUPPORTSCSSVARS;},
        isUnbounded: () => {return false;},
        isSurfaceActive: () => {return button === DOM.activeElement;},
        addClass: button.classList.add.bind(button.classList),
        removeClass: button.classList.remove.bind(button.classList),
        registerInteractionHandler: button.addEventListener.bind(button),
        deregisterInteractionHandler: button.removeEventListener.bind(button),
        registerResizeHandler: window.addEventListener.bind(window, 'resize'),
        deregisterResizeHandle: window.removeEventListener.bind(window, 'resize'),
        updateCssVariable: button.style.setProperty.bind(button.style),
        computeBoundingRect: button.getBoundingClientRect.bind(button),
        getWindowPageOffset: () => {return {x: window.pageXOffset, y: window.pageYOffset};}
      }));
    });

    CALLBACKS.open = DIALOG.isOpen.bind(DIALOG);
    CALLBACKS.show = TaskQueue.queueMicroTask.bind(TaskQueue, () => {
      btnRipples.forEach((ripple) => ripple.init());
      DIALOG.open();
    });
    CALLBACKS.close = TaskQueue.queueMicroTask.bind(TaskQueue, () => {
      DIALOG.close();
      btnRipples.forEach((ripple) => ripple.destroy());
    });
    this.dialogFoundation = DIALOG;
 
  };

  applyPassive() {
    let isSupported = false;
    try {
      window.document.addEventListener('test', null, {get passive() {
        isSupported = true;
      }});
    } catch (e) { };

    return isSupported ? {passive: true} : false;
  };

  browserSupportsCssVars() {
    const supportsFunctionPresent = window.CSS && typeof window.CSS.supports === 'function';
    if (!supportsFunctionPresent) {return;};
    const explicitlySupportsCssVars = window.CSS.supports('--css-vars', 'yes');
    const weAreFeatureDetectingSafari10plus = (
      window.CSS.supports('(--css-vars: yes)') &&
      window.CSS.supports('color', '#00000000')
    );
    return explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus;
  };

  bind(context, extContext) {
    if (this.open) {context[this.open] = this.callbacks.open;};
    if (this.show) {context[this.show] = this.callbacks.show;};
    if (this.close) {context[this.close] = this.callbacks.close;};
    this.callbacks.accept = this.accept ? context[this.accept].bind(context) : () => {};
    this.callbacks.cancel = this.cancel ? context[this.cancel].bind(context) : () => {};
  };

  attached() {
    this.dialogFoundation.init();
  };

  detached() {
    this.dialogFoundation.destroy();
  };
};