import {inject, bindable, bindingMode, TaskQueue, DOM} from 'aurelia-framework';
import {MDCIconToggleFoundation} from '@material/icon-toggle';
import {MDCRippleFoundation} from '@material/ripple';

@inject(Element, TaskQueue)
export class MdcIconToggleCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.twoWay, defaultValue: null}) on;
  @bindable ({defaultBindingMode: bindingMode.oneWay, defaultValue: null}) disabled;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) change;
  context;

  constructor(Element, TaskQueue) {
    const BROWSERSUPPORTSCSSVARS = this.browserSupportsCssVars();
    const {iconInnerSelector: sel} = Element.dataset;
    const iconElement = sel ? Element.querySelector(sel) : Element;

    this.iconToggleFoundation = new MDCIconToggleFoundation({
      addClass: iconElement.classList.add.bind(iconElement.classList),
      removeClass: iconElement.classList.remove.bind(iconElement.classList),
      registerInteractionHandler: Element.addEventListener.bind(Element),
      deregisterInteractionHandler: Element.removeEventListener.bind(Element),
      setText: (text) => {iconElement.textContent = text;},
      getTabIndex: Element.getAttribute.bind(Element, 'tabIndex'),
      setTabIndex: Element.setAttribute.bind(Element, 'tabIndex'),
      getAttr: Element.getAttribute.bind(Element),
      setAttr: Element.setAttribute.bind(Element),
      rmAttr: Element.removeAttribute.bind(Element),
      notifyChange: function(evtData) {
        this.on = evtData.isOn;
        if (this.change !== null) {TaskQueue.queueMicroTask(this.context[this.change].bind(this.context, evtData));};
      } .bind(this)
    });

    this.rippleFoundation = new MDCRippleFoundation({
      browserSupportsCssVars: () => {return BROWSERSUPPORTSCSSVARS;},
      isUnbounded: () => {return true;},
      isSurfaceActive: () => { return Element === DOM.activeElement; },
      addClass: Element.classList.add.bind(Element.classList),
      removeClass: Element.classList.remove.bind(Element.classList),
      registerInteractionHandler: Element.addEventListener.bind(Element),
      deregisterInteractionHandler: Element.removeEventListener.bind(Element),
      registerResizeHandler: window.addEventListener.bind(window, 'resize'),
      deregisterResizeHandle: window.removeEventListener.bind(window, 'resize'),
      updateCssVariable: Element.style.setProperty.bind(Element.style),
      computeBoundingRect: () => {
          const {left, top} = Element.getBoundingClientRect();
          const DIM = 48;
          return {left, top, width: DIM, height: DIM, right: left + DIM, bottom: top + DIM};
        },
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
    this.context = context;
    if (this.on !== null) {this.iconToggleFoundation.toggle(this.on);};
    if (this.disabled !== null) {this.iconToggleFoundation.setDisabled(this.disabled);};
  };

  attached() {
    this.iconToggleFoundation.init();
    this.rippleFoundation.init();
  };

  detached() {
    this.rippleFoundation.init();
    this.iconToggleFoundation.destroy();
  };

  onChanged(newVal, oldVal) {
    this.iconToggleFoundation.toggle(newVal);
  };

  disabledChanged(newVal, oldVal) {
    this.iconToggleFoundation.setDisabled(newVal);
  };

};