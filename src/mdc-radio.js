import {inject, bindable, bindingMode, ObserverLocator, TaskQueue, DOM} from 'aurelia-framework';
import {MDCRadioFoundation} from '@material/radio';
import {MDCRippleFoundation} from '@material/ripple';
import {MDCFormFieldFoundation} from '@material/form-field';

@inject(Element, ObserverLocator, TaskQueue)
export class MdcRadioCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.twoWay, defaultValue: null}) checked;
  @bindable ({defaultBindingMode: bindingMode.oneWay, defaultValue: null}) disabled;

  formFieldFoundation = null;
  observer = null;
  observerCallback;
  nativeControl;
  radioFoundation;
  rippleFoundation;

  constructor(Element, ObserverLocator, TaskQueue) {
    const RADIO = Element.classList.contains('mdc-radio') ? Element : Element.querySelector(`.mdc-radio`);
    const NATIVECONTROL = RADIO.querySelector(MDCRadioFoundation.strings.NATIVE_CONTROL_SELECTOR);
    const BROWSERSUPPORTSCSSVARS = this.browserSupportsCssVars();

    this.observerLocator = ObserverLocator;
    this.nativeControl = NATIVECONTROL;
    this.taskQueue = TaskQueue;

    this.radioFoundation = new MDCRadioFoundation({
      getNativeControl: () => {return NATIVECONTROL;},
      addClass: RADIO.classList.add.bind(Element.classList),
      removeClass: RADIO.classList.remove.bind(Element.classList),
    });

    this.rippleFoundation = new MDCRippleFoundation({
      browserSupportsCssVars: () => {return BROWSERSUPPORTSCSSVARS;},
      isUnbounded: () => {return true;},
      isSurfaceActive: () => {return false;},
      addClass: RADIO.classList.add.bind(RADIO.classList),
      removeClass: RADIO.classList.remove.bind(RADIO.classList),
      registerInteractionHandler: NATIVECONTROL.addEventListener.bind(NATIVECONTROL),
      deregisterInteractionHandler: NATIVECONTROL.removeEventListener.bind(NATIVECONTROL),
      registerResizeHandler: window.addEventListener.bind(window, 'resize'),
      deregisterResizeHandler: window.removeEventListener.bind(window, 'resize'),
      updateCssVariable: RADIO.style.setProperty.bind(RADIO.style),
      computeBoundingRect: () => {
          const {left, top} = RADIO.getBoundingClientRect();
          const DIM = 40;
          return {left, top, width: DIM, height: DIM, right: left + DIM, bottom: top + DIM};
        },
      getWindowPageOffset: () => {return {x: window.pageXOffset, y: window.pageYOffset};}
    });

    if (Element !== RADIO) {
      const LABEL = Element.querySelector(MDCFormFieldFoundation.strings.LABEL_SELECTOR);
      this.formFieldFoundation = new MDCFormFieldFoundation({
        registerInteractionHandler: LABEL.addEventListener.bind(LABEL),
        deregisterInteractionHandler: LABEL.removeEventListener.bind(LABEL),
        activateInputRipple: this.rippleFoundation.activate.bind(this.rippleFoundation),
        deactivateInputRipple:  this.rippleFoundation.deactivate.bind(this.rippleFoundation)
      });
    };
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

  attached() {
    this.radioFoundation.init();
    this.rippleFoundation.init();
    if (this.formFieldFoundation !== null) {this.formFieldFoundation.init();};
    if (this.checked !== null) {
      this.observerCallback = (newValue, oldValue) => {this.checked = newValue;};
      this.observer = this.observerLocator.getObserver(this.nativeControl, 'checked');
      this.observer.subscribe(this, this.observerCallback);
    };
  };

  detached() {
    if (this.observer !== null) {this.observer.unsubscribe(this, this.observerCallback);};
    if (this.formFieldFoundation !== null) {this.formFieldFoundation.destroy();};
    this.rippleFoundation.destroy();
    this.radioFoundation.destroy();
  };

  checkedChanged(newVal, oldVal) {
    this.taskQueue.queueMicroTask(this.radioFoundation.setChecked.bind(this.radioFoundation, newVal));
  };

  disabledChanged(newVal, oldVal) {
    this.taskQueue.queueMicroTask(this.radioFoundation.setDisabled.bind(this.radioFoundation, newVal));
  };

};