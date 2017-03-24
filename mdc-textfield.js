import {inject, bindable, bindingMode} from 'aurelia-framework';
import {MDCTextfieldFoundation} from '@material/textfield';

@inject(Element)
export class MdcTextfieldCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.oneWay, defaultValue: null}) disabled;

  constructor(Element) {
    const LABEL = Element.querySelector(".mdc-textfield__label");
    const INPUT = Element.querySelector(".mdc-textfield__input");
    const HELP = INPUT.hasAttribute('aria-controls') ?
      document.getElementById(INPUT.getAttribute('aria-controls')) : null;
    const DUMMY = () => {};

    this.textfieldFoundation = new MDCTextfieldFoundation({
      addClass: Element.classList.add.bind(Element.classList),
      removeClass: Element.classList.remove.bind(Element.classList),
      addClassToLabel: LABEL ? LABEL.classList.add.bind(LABEL.classList) : DUMMY,
      removeClassFromLabel: LABEL ? LABEL.classList.remove.bind(LABEL.classList) : DUMMY,
      addClassToHelptext: HELP ? HELP.classList.add.bind(HELP.classList) : DUMMY,
      removeClassFromHelptext: HELP ? HELP.classList.remove.bind(HELP.classList) : DUMMY,
      helptextHasClass: HELP ? HELP.classList.remove.bind(HELP.classList) : () => false,
      setHelptextAttr: HELP ? HELP.setAttribute.bind(HELP) : DUMMY,
      removeHelptextAttr: HELP ? HELP.removeAttribute.bind(HELP) : DUMMY,
      registerInputFocusHandler: INPUT.addEventListener.bind(INPUT, 'focus'),
      registerInputBlurHandler: INPUT.addEventListener.bind(INPUT, 'blur'),
      registerInputInputHandler: INPUT.addEventListener.bind(INPUT, 'input'),
      registerInputKeydownHandler: INPUT.addEventListener.bind(INPUT, 'keydown'),
      deregisterInputFocusHandler: INPUT.removeEventListener.bind(INPUT, 'focus'),
      deregisterInputBlurHandler: INPUT.removeEventListener.bind(INPUT, 'blur'),
      deregisterInputInputHandler: INPUT.removeEventListener.bind(INPUT, 'input'),
      deregisterInputKeydownHandler: INPUT.removeEventListener.bind(INPUT, 'keydown'),
      getNativeInput: () => {return INPUT;}
    });
  };

  attached() {
    this.textfieldFoundation.init();
  };

  detached() {
    this.textfieldFoundation.destroy();
  };

  disabledChanged(newVal, oldVal) {
    this.checkboxFoundation.setDisabled(newVal);
  };

};