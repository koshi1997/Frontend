import { Injectable } from '@angular/core';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  role: string;
}

const MENUITEM = [
  {
    state: 'dashboard',
    name: 'Dashboard',
    type: 'link',
    icon: 'dashboard',
    role: '',
  },
  {
    state: 'category',
    name: 'Manage Category',
    type: 'link',
    icon: 'category',
    role: '',
  },
  {
    state: 'product',
    name: 'Manage product',
    type: 'link',
    icon: 'inventory_2',
    role: '',
  },
  {
    state: 'order',
    name: 'Manage Order',
    type: 'link',
    icon: 'shopping_cart',
    role: '',
  }
];

@Injectable()
export class MenuItems {
  getMenuitem(): Menu[] {
    return MENUITEM;
  }
}
