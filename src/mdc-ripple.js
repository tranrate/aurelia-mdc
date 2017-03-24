import {inject, bindable, bindingMode, TaskQueue, DOM} from 'aurelia-framework';
import {MDCRippleFoundation} from '@material/ripple';

@inject(Element)
export class MdcRippleCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.oneWay, defaultValue: null}) unbounded;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) activate;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) deactivate;

  constructor(Element) {
    const BROWSERSUPPORTSCSSVARS = this.browserSupportsCssVars();

    this.taskQueue = TaskQueue;

    this.rippleFoundation = new MDCRippleFoundation({
      browserSupportsCssVars: () => {return BROWSERSUPPORTSCSSVARS;},
      isUnbounded: function() {return this.unbounded;} .bind(this),
      isSurfaceActive: () => {return Element === DOM.activeElement;},
      addClass: Element.classList.add.bind(Element.classList),
      removeClass: Element.classList.remove.bind(Element.classList),
      registerInteractionHandler: Element.addEventListener.bind(Element),
      deregisterInteractionHandler: Element.removeEventListener.bind(Element),
      registerResizeHandler: window.addEventListener.bind(window, 'resize'),
      deregisterResizeHandle: window.removeEventListener.bind(window, 'resize'),
      updateCssVariable: Element.style.setProperty.bind(Element.style),
      computeBoundingRect: Element.getBoundingClientRect.bind(Element),
      getWindowPageOffset: () => {return {x: window.pageXOffset, y: window.pageYOffset};}
    });
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
    if (this.activate) {context[this.activate] = 
      this.taskQueue.queueMicroTask.bind(this.taskQueue, this.rippleFoundation.activate.bind(this.rippleFoundation));
    };
    if (this.deactivate) {context[this.deactivate] = 
      this.taskQueue.queueMicroTask.bind(this.taskQueue, this.rippleFoundation.deactivate.bind(this.rippleFoundation));
    };
  };

  attached() {
    this.rippleFoundation.init();
  };

  detached() {
    this.rippleFoundation.destroy();
  };
};

