import {inject, bindable, bindingMode, ObserverLocator, DOM} from 'aurelia-framework';
import {MDCCheckboxFoundation} from '@material/checkbox';
import {getCorrectEventName} from '@material/animation';
import {MDCRippleFoundation} from '@material/ripple';
import {MDCFormFieldFoundation} from '@material/form-field';

@inject(Element, ObserverLocator)
export class MdcCheckboxCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.twoWay, defaultValue: null}) checked;
  @bindable ({defaultBindingMode: bindingMode.twoWay, defaultValue: null}) indeterminate;
  @bindable ({defaultBindingMode: bindingMode.oneWay, defaultValue: null}) disabled;
  attachedToDom = false;
  formFieldFoundation = null;
  checkboxFoundation;
  rippleFoundation;

  constructor(Element, ObserverLocator) {
    const CHECKBOX = Element.classList.contains('mdc-checkbox') ? Element : Element.getElementsByClassName('mdc-checkbox')[0];
    const INPUTELEMENT = CHECKBOX.getElementsByTagName('input')[0];

    const OVERLAY = 
`<div class="mdc-checkbox__background">
   <svg version="1.1" class="mdc-checkbox__checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
     <path class="mdc-checkbox__checkmark__path" fill="none" stroke="white" d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
   </svg>
   <div class="mdc-checkbox__mixedmark"></div>
 </div>`;

    const ANIMATIONEND = getCorrectEventName(window, 'animationend');
    const BROWSERSUPPORTSCSSVARS = this.browserSupportsCssVars();

    CHECKBOX.insertAdjacentHTML('beforeend', OVERLAY);

    this.checkboxFoundation = new MDCCheckboxFoundation({
      addClass: (className) => CHECKBOX.classList.add.bind(CHECKBOX.classList),
      removeClass: (className) =>CHECKBOX.classList.remove.bind(CHECKBOX.classList),
      registerAnimationEndHandler: CHECKBOX.addEventListener.bind(CHECKBOX, ANIMATIONEND),
      deregisterAnimationEndHandler: CHECKBOX.removeEventListener.bind(CHECKBOX, ANIMATIONEND),
      registerChangeHandler: INPUTELEMENT.addEventListener.bind(INPUTELEMENT, 'change'),
      deregisterChangeHandler: INPUTELEMENT.removeEventListener.bind(INPUTELEMENT, 'change'),
      getNativeControl: () => {return INPUTELEMENT;},
      forceLayout: () => {},
      isAttachedToDOM: function() {return this.attachedToDom;} .bind(this)
    });

    this.rippleFoundation = new MDCRippleFoundation({
      browserSupportsCssVars: () => {return BROWSERSUPPORTSCSSVARS;},
      isUnbounded: () => {return true;},
      isSurfaceActive: () => {return INPUTELEMENT === DOM.activeElement; },
      addClass: CHECKBOX.classList.add.bind(CHECKBOX.classList),
      removeClass: CHECKBOX.classList.remove.bind(CHECKBOX.classList),
      registerInteractionHandler: INPUTELEMENT.addEventListener.bind(INPUTELEMENT),
      deregisterInteractionHandler: INPUTELEMENT.removeEventListener.bind(INPUTELEMENT),
      registerResizeHandler: window.addEventListener.bind(window, 'resize'),
      deregisterResizeHandle: window.removeEventListener.bind(window, 'resize'),
      updateCssVariable: CHECKBOX.style.setProperty.bind(CHECKBOX.style),
      computeBoundingRect: () => {
          const {left, top} = CHECKBOX.getBoundingClientRect();
          const DIM = 40;
          return {left, top, width: DIM, height: DIM, right: left + DIM, bottom: top + DIM};
        },
      getWindowPageOffset: () => {return {x: window.pageXOffset, y: window.pageYOffset};}
    });

    if (Element !== CHECKBOX) {
      const LABEL = Element.getElementsByTagName('label')[0];
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
    this.attachedToDom = true;
    this.checkboxFoundation.init();
    this.rippleFoundation.init();
    if (this.formFieldFoundation !== null) {this.formFieldFoundation.init();};
    if (this.checked !== null) {
      this.observerCallback = (newValue, oldValue) => {
        this.checked = newValue;
        this.indeterminate = false;
      };
      this.observer = this.observerLocator.getObserver(this.inputElement, 'checked');
      this.observer.subscribe(this, this.observerCallback);
    };
  };

  detached() {
    if (this.observer !== null) {this.observer.unsubscribe(this, this.observerCallback);};
    if (this.formFieldFoundation !== null) {this.formFieldFoundation.destroy();};
    this.rippleFoundation.destroy();
    this.checkboxFoundation.destroy();
  };

  checkedChanged(newVal, oldVal) {
    this.checkboxFoundation.setChecked(newVal);
    this.indeterminate = false;
  };

  indeterminateChanged(newVal, oldVal) {
    this.checkboxFoundation.setIndeterminate(newVal);
  };

  disabledChanged(newVal, oldVal) {
    this.checkboxFoundation.setDisabled(newVal);
  };

};