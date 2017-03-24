import {inject, bindable, bindingMode, DOM, PLATFORM, TaskQueue} from 'aurelia-framework';
import {MDCSelectFoundation} from '@material/select';
import {MDCSimpleMenuFoundation} from '@material/menu';

@inject(Element, TaskQueue)
export class MdcSelectCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.twoWay, defaultValue: null}) value;
  @bindable ({defaultBindingMode: bindingMode.twoWay, defaultValue: null}) selectedIndex;
  @bindable ({defaultBindingMode: bindingMode.oneWay, defaultValue: null}) disabled;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) change;
  menuFoundation;
  selectFoundation;
  context;

  constructor(Element, TaskQueue) {
    const MENUEL = Element.querySelector('.mdc-select__menu');
    const SELECTEDTEXT = Element.querySelector('.mdc-select__selected-text');
    const TRANSFORM = this.getTransformPropertyName();
    const ITEMSCONTAINER = MENUEL.querySelector(MDCSimpleMenuFoundation.strings.ITEMS_SELECTOR);
    const ITEMS = () => {return ITEMSCONTAINER.querySelectorAll('.mdc-list-item[role]');};
    let listen = {};
    let previousFocus;

    const MENU = new MDCSimpleMenuFoundation({
      addClass: MENUEL.classList.add.bind(MENUEL.classList),
      removeClass: MENUEL.classList.remove.bind(MENUEL.classList),
      hasClass: MENUEL.classList.contains.bind(MENUEL.classList),
      hasNecessaryDom: () => {return Boolean(ITEMSCONTAINER);},
      getInnerDimensions: () => {return {width: ITEMSCONTAINER.offsetWidth, height: ITEMSCONTAINER.offsetHeight};},
      hasAnchor: Element.classList.contains.bind(Element.classList, 'mdc-menu-anchor'),
      getAnchorDimensions: Element.getBoundingClientRect.bind(Element),
      getWindowDimensions: () => {return {width: window.innerWidth, height: window.innerHeight};},
      setScale: (x, y) => {MENUEL.style[TRANSFORM] = `scale(${x}, ${y})`;},
      setInnerScale: (x, y) => {ITEMSCONTAINER.style[TRANSFORM] = `scale(${x}, ${y})`;},
      getNumberOfItems: () => {return ITEMS().length;},
      registerInteractionHandler: MENUEL.addEventListener.bind(MENUEL),
      deregisterInteractionHandler: MENUEL.removeEventListener.bind(MENUEL),
      registerDocumentClickHandler: DOM.addEventListener.bind(DOM,'click'),
      deregisterDocumentClickHandler: DOM.removeEventListener.bind(DOM,'click'),
      getYParamsForItemAtIndex: (index) => {const {offsetTop: top, offsetHeight: height} = ITEMS()[index]; return {top, height};},
      setTransitionDelayForItemAtIndex: (index, value) => {ITEMS()[index].style.setProperty('transition-delay', value);},
      getIndexForEventTarget: (target) => {return [].slice.call(ITEMS()).indexOf(target);},
      notifySelected: (evtData) => {listen.selected.call(SELECT, {detail: {index: evtData.index, item: ITEMS()[evtData.index]}});},
      notifyCancel: (evtData) => {listen.cancel.call(SELECT, evtData);},
      saveFocus: () => {previousFocus = DOM.activeElement;},
      restoreFocus: () => {if (previousFocus) {previousFocus.focus();};},
      isFocused: () => {return DOM.activeElement === MENUEL;},
      focus: MENUEL.focus.bind(MENUEL),
      getFocusedItemIndex: () => {return [].slice.call(ITEMS()).indexOf(DOM.activeElement);},
      focusItemAtIndex: (index) => {ITEMS()[index].focus()},
      isRtl: () => {return getComputedStyle(MENUEL).getPropertyValue('direction') === 'rtl';},
      setTransformOrigin: (origin) => {MENUEL.style[`${TRANSFORM}-origin`] = origin;},
      setPosition: (position) => {
        MENUEL.style.left = 'left' in position ? position.left : null;
        MENUEL.style.right = 'right' in position ? position.right : null;
        MENUEL.style.top = 'top' in position ? position.top : null;
        MENUEL.style.bottom = 'bottom' in position ? position.bottom : null;
      },
      getAccurateTime: PLATFORM.performance.now.bind(PLATFORM.performance)
    });

    this.menuFoundation = MENU;

    const SELECT = new MDCSelectFoundation({
      addClass: Element.classList.add.bind(Element.classList),
      removeClass: Element.classList.remove.bind(Element.classList),
      setAttr: Element.setAttribute.bind(Element),
      rmAttr: Element.removeAttribute.bind(Element),
      computeBoundingRect: Element.getBoundingClientRect.bind(Element),
      registerInteractionHandler: Element.addEventListener.bind(Element),
      deregisterInteractionHandler: Element.removeEventListener.bind(Element),
      focus: Element.focus.bind(Element),
      makeTabbable: () => {Element.tabIndex = 0;},
      makeUntabbable: () => {Element.tabIndex = -1;},
      getComputedStyleValue: (prop) => {return DOM.getComputedStyle(Element).getPropertyValue(prop);},
      setStyle: Element.style.setProperty.bind(Element.style),
      create2dRenderingContext: () => {return DOM.createElement('canvas').getContext('2d');},
      setMenuElStyle: MENUEL.style.setProperty.bind(MENUEL.style),
      setMenuElAttr: MENUEL.setAttribute.bind(MENUEL),
      rmMenuElAttr: MENUEL.removeAttribute.bind(MENUEL),
      getMenuElOffsetHeight: () => {return MENUEL.offsetHeight;},
      getOffsetTopForOptionAtIndex: (index) => {return ITEMS()[index].offsetTop;},
      openMenu: (index) => {MENU.open({focusIndex: index});},
      isMenuOpen: MENU.isOpen.bind(MENU),
      setSelectedTextContent: (selectedTextContent) => {SELECTEDTEXT.textContent = selectedTextContent;},
      getNumberOfOptions: () => {return ITEMS().length;},
      getTextForOptionAtIndex: (index) => {return ITEMS()[index].textContent;},
      getValueForOptionAtIndex: (index) => {return ITEMS()[index].id || ITEMS()[index].textContent;},
      setAttrForOptionAtIndex: (index, attr, value) => {ITEMS()[index].setAttribute(attr, value);},
      rmAttrForOptionAtIndex: (index, attr) => {ITEMS()[index].removeAttribute(attr);},
      getOffsetTopForOptionAtIndex: (index) => {return ITEMS()[index].offsetTop;},
      registerMenuInteractionHandler: (type, handler) => {listen[type.slice(14)] = handler;},
      deregisterMenuInteractionHandler: (type, handler) => {listen.delete[type.slice(14)];},
      notifyChange: function(evtData) {
        this.selectedIndex = SELECT.getSelectedIndex();
        this.value = SELECT.getValue();
        if (this.change !== null) {
          let eventData = {detail: {value: this.value, index: this.SelectedIndex}};
          TaskQueue.queueMicroTask(this.context[this.change].bind(this.context, eventData));
        };
      } .bind(this),
      getWindowInnerHeight: () => {return window.innerHeight;},
    });
    this.selectFoundation = SELECT;
  };

  getTransformPropertyName() {
    const el = DOM.createElement('div');
    return ('transform' in el.style ? 'transform' : 'webkitTransform');
  };

  bind(context, extContext) {
    this.context = context;
  };

  attached() {
    this.selectFoundation.init();
    this.menuFoundation.init();
    if (this.selectedIndex !== null) {
      this.selectFoundation.setSelectedIndex(this.selectedIndex);
      this.value = this.selectFoundation.getValue();
    };
    if (this.disabled !== null) {this.selectFoundation.setDisabled(this.disabled);};
  };

  detached() {
    this.menuFoundation.destroy();
    this.selectFoundation.destroy();
  };

  selectedIndexChanged(newVal, oldVal) {
    this.selectFoundation.setSelectedIndex(newVal);
    this.value = this.selectFoundation.getValue();
  };

  disabledChanged(newVal, oldVal) {
    this.selectFoundation.setDisabled(newVal)
  };

};
