import {DOM, inject, bindable, bindingMode, TaskQueue} from 'aurelia-framework';
import {MDCTemporaryDrawerFoundation} from '@material/drawer';
import {getCorrectEventName} from '@material/animation';

@inject(Element, TaskQueue)
export class MdcTemporaryDrawerCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) open;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) isOpen;

  constructor(Element, TaskQueue) {
    const DRAWER = Element.querySelector(MDCTemporaryDrawerFoundation.strings.DRAWER_SELECTOR);
    const FOCUSABLE_ELEMENTS = MDCTemporaryDrawerFoundation.strings.FOCUSABLE_ELEMENTS;
    const TAB_DATA = 'data-mdc-tabindex';
    const TAB_DATA_HANDLED = 'data-mdc-tabindex-handled';
    const OPACITY_VAR_NAME = MDCTemporaryDrawerFoundation.strings.OPACITY_VAR_NAME;
    const EVENTS = this.getEventNames();
    const PASSIVE = this.applyPassive();
    const TRANSITIONEND = getCorrectEventName(window, 'animation');
    const TRANSFORM = this.getTransformPropertyName();

    const TEMPORARYDRAWER = new MDCTemporaryDrawerFoundation({
      addClass: Element.classList.add.bind(Element.classList),
      removeClass: Element.classList.remove.bind(Element.classList),
      hasClass: Element.classList.contains.bind(Element.classList),
      hasNecessaryDom: () => {return Boolean(DRAWER);},
      registerInteractionHandler: (evt, handler) => {Element.addEventListener(EVENTS[evt], handler, PASSIVE);},
      deregisterInteractionHandler: (evt, handler) => {Element.removeEventListener(EVENTS[evt], handler, PASSIVE);},
      registerDrawerInteractionHandler: (evt, handler) => {DRAWER.addEventListener(EVENTS[evt], handler);},
      deregisterDrawerInteractionHandler: (evt, handler) => {DRAWER.removeEventListener(EVENTS[evt], handler);},
      registerTransitionEndHandler: DRAWER.addEventListener.bind(DRAWER, TRANSITIONEND),
      deregisterTransitionEndHandler: DRAWER.removeEventListener.bind(DRAWER, TRANSITIONEND),
      registerDocumentKeydownHandler: document.addEventListener.bind(document, 'keydown'),
      deregisterDocumentKeydownHandler: document.removeEventListener.bind(document, 'keydown'),
      getDrawerWidth: () => {return DRAWER.offsetWidth;},
      setTranslateX: (value) => {
        DRAWER.style.setProperty(TRANSFORM, value === null ? null : `translateX(${value}px)`);
      },
      updateCssVariable: (value) => {
        if ('CSS' in window && window.CSS.supports('(--color: red)')) {
          Element.style.setProperty(OPACITY_VAR_NAME, value);
        };
      },
      getFocusableElements: DRAWER.querySelectorAll.bind(DRAWER, FOCUSABLE_ELEMENTS),
      saveElementTabState: (el) => {
        if (el.hasAttribute('tabindex')) {
          el.setAttribute(TAB_DATA, el.getAttribute('tabindex'));
        };
        el.setAttribute(TAB_DATA_HANDLED, true);
      },
      restoreElementTabState: (el) => {
        if (el.hasAttribute(TAB_DATA_HANDLED)) {
          if (el.hasAttribute(TAB_DATA)) {
            el.setAttribute('tabindex', el.getAttribute(TAB_DATA));
            el.removeAttribute(TAB_DATA);
          } else {
            el.removeAttribute('tabindex');
          };
          el.removeAttribute(TAB_DATA_HANDLED);
        };
      },
      makeElementUntabbable: (el) => {el.setAttribute('tabindex', -1);},
      isRtl: () => {return getComputedStyle(Element).getPropertyValue('direction') === 'rtl';},
      isDrawer: (el) => {return el === DRAWER;}
    });

    this.myOpen = (open) => {TaskQueue.queueMicroTask(TEMPORARYDRAWER[open ? 'open' : 'close'].bind(TEMPORARYDRAWER));};
    this.myIsOpen = TEMPORARYDRAWER.isOpen.bind(TEMPORARYDRAWER);
    this.temporaryDrawerFoundation = TEMPORARYDRAWER;
  };

  getEventNames() {
    return 'ontouchstart' in window.document ? 
      {touchstart: 'touchstart', touchmove: 'touchmove', touchend: 'touchend', click: 'click'}
    :
      {touchstart: 'pointerdown', touchmove: 'pointermove', touchend: 'pointerup', click: 'click'};
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

  getTransformPropertyName() {
    const el = DOM.createElement('div');
    return ('transform' in el.style ? 'transform' : 'webkitTransform');
  };

  bind(context, extContext) {
    if (this.open) {context[this.open] = this.myOpen;};
    if (this.isOpen) {context[this.open] = this.myIsOpen;};
  };

  attached() {
    this.temporaryDrawerFoundation.init();
    this.setState = this.mySetState;
    this.isOpen = this.myIsOpen;
  };

  detached() {
    this.temporaryDrawerFoundation.destroy();
  };
};