import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class App{
  checked = false;
  openSnackbar;
  drawer;
  showdialog;
  openmenu;

  products = ['Motherboard', 'CPU', 'Memory'];
  selectedProduct = null;

  constructor(EventAggregator) {
    this.eventAggregator = EventAggregator;
  };

  handleApply() {
    this.drawer(true);
  };

  handleApply1() {
    this.openmenu({focusIndex: 1});
  };

  handleApply2() {
    this.openSnackbar({message: "Snackbar here"});
  };

  handleApply3() {
    this.showdialog();
  };

  handleIconToggle(event) {
  };

};
