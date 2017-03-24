import {inject, bindable, bindingMode, DOM, PLATFORM, TaskQueue} from 'aurelia-framework';
import {MDCSimpleMenuFoundation} from '@material/menu';

@inject(Element, TaskQueue)
export class MdcSimpleMenuCustomAttribute {
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) selected;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) cancel;
  @bindable ({defaultBindingMode: bindingMode.twoWay, defaultValue: null}) open;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) show;
  @bindable ({defaultBindingMode: bindingMode.oneTime, defaultValue: null}) hide;
  callbacks = {};

  constructor(Element, TaskQueue) {
    const TRANSFORM = this.getTransformPropertyName();
    const ITEMSCONTAINER = Element.querySelector(MDCSimpleMenuFoundation.strings.ITEMS_SELECTOR);
    const ITEMS = () => {return ITEMSCONTAINER.querySelectorAll('.mdc-list-item[role]');};
    const ANCHOR = Element.parentElement;
    const CALLBACKS = this.callbacks;
    let previousFocus;

    const MENU = new MDCSimpleMenuFoundation({
      addClass: Element.classList.add.bind(Element.classList),
      removeClass: Element.classList.remove.bind(Element.classList),
      hasClass: Element.classList.contains.bind(Element.classList),
      hasNecessaryDom: () => {return Boolean(ITEMSCONTAINER);},
      getInnerDimensions: () => {return {width: ITEMSCONTAINER.offsetWidth, height: ITEMSCONTAINER.offsetHeight};},
      hasAnchor: ANCHOR.classList.contains.bind(ANCHOR.classList, 'mdc-menu-anchor'),
      getAnchorDimensions: ANCHOR.getBoundingClientRect.bind(ANCHOR),
      getWindowDimensions: () => {return {width: window.innerWidth, height: window.innerHeight};},
      setScale: (x, y) => {Element.style[TRANSFORM] = `scale(${x}, ${y})`;},
      setInnerScale: (x, y) => {ITEMSCONTAINER.style[TRANSFORM] = `scale(${x}, ${y})`;},
      getNumberOfItems: () => {return ITEMS().length;},
      registerInteractionHandler: Element.addEventListener.bind(Element),
      deregisterInteractionHandler: Element.removeEventListener.bind(Element),
      registerDocumentClickHandler: DOM.addEventListener.bind(DOM,'click'),
      deregisterDocumentClickHandler: DOM.removeEventListener.bind(DOM,'click'),
      getYParamsForItemAtIndex: (index) => {const {offsetTop: top, offsetHeight: height} = ITEMS()[index]; return {top, height};},
      setTransitionDelayForItemAtIndex: (index, value) => {ITEMS()[index].style.setProperty('transition-delay', value);},
      getIndexForEventTarget: (target) => {return [].slice.call(ITEMS()).indexOf(target);},
      notifySelected: (evtData) => {
        if (CALLBACKS.hasOwnProperty('selected')) {
          let eventData = {detail: {index: evtData.index, item: ITEMS()[evtData.index]}};
          TaskQueue.queueMicroTask(CALLBACKS.selected.bind(CALLBACKS.context, eventData));
        };
      },
      notifyCancel: (evtData) => {
        if (CALLBACKS.hasOwnProperty('cancel')) {
          TaskQueue.queueMicroTask(CALLBACKS.cancel.bind(CALLBACKS.context, eventData));
        };
      },
      saveFocus: () => {previousFocus = DOM.activeElement;},
      restoreFocus: () => {if (previousFocus) {previousFocus.focus();};},
      isFocused: () => {return DOM.activeElement === Element;},
      focus: Element.focus.bind(Element),
      getFocusedItemIndex: () => {return [].slice.call(ITEMS()).indexOf(DOM.activeElement);},
      focusItemAtIndex: (index) => {ITEMS()[index].focus();},
      isRtl: () => {return getComputedStyle(Element).getPropertyValue('direction') === 'rtl';},
      setTransformOrigin: (origin) => {Element.style[`${TRANSFORM}-origin`] = origin;},
      setPosition: (position) => {
        Element.style.left = 'left' in position ? position.left : null;
        Element.style.right = 'right' in position ? position.right : null;
        Element.style.top = 'top' in position ? position.top : null;
        Element.style.bottom = 'bottom' in position ? position.bottom : null;
      },
      getAccurateTime: PLATFORM.performance.now.bind(PLATFORM.performance)
    });

    CALLBACKS.show = ({focusIndex = null} = {}) => {
      TaskQueue.queueMicroTask(MENU.open.bind(MENU, {focusIndex: focusIndex}));
    };
    CALLBACKS.hide = TaskQueue.queueMicroTask.bind(TaskQueue, MENU.close.bind(MENU));
    this.menuFoundation = MENU;
  };

  getTransformPropertyName() {
    const el = DOM.createElement('div');
    return ('transform' in el.style ? 'transform' : 'webkitTransform');
  };

  bind(context, extContext) {
    this.callbacks.context = context;
    if (this.selected !== null) {this.callbacks.selected = context[this.selected];};
    if (this.cancel !== null) {this.callbacks.cancel = context[this.cancel];};
    if (this.show !== null) {context[this.show] = this.callbacks.show;};
    if (this.hide !== null) {context[this.close] = this.callbacks.hide;};
  };

  attached() {
    this.menuFoundation.init();
    if (this.open !== null) {this.menuFoundation[this.open ? 'open' : 'close']();};
  };

  detached() {
    this.menuFoundation.destroy();
  };

  openChanged(newVal, oldVal) {
    this.callbacks[newVal ? 'open' : 'close']();
  };
};