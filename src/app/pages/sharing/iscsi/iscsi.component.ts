import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';

@Component({
  selector : 'iscsi',
  templateUrl: './iscsi.component.html',
  styleUrls: ['./iscsi.component.css']
})
export class ISCSI implements OnInit{
  getActions() {
    return [];
  }
   @ViewChild('tabGroup') tabGroup;
   protected indexMap: any[] = ['configuration', 'portals', 'initiator', 'auth', 'target', 'extent', 'associatedtarget'];

  constructor( protected router: Router, protected aroute: ActivatedRoute, ) {}

  ngOnInit() {
    this.aroute.params.subscribe(params => {
      this.selectTab(params['pk']);
    });
  }

  selectTab(tabName: any) {
    let index = _.indexOf(this.indexMap, tabName);
    this.tabGroup.selectedIndex = index;
  }

  onSelectChange($event: any) {
    //update url
    let pk = this.indexMap[$event.index];
    this.router.navigate(new Array('/sharing/iscsi').concat(pk));
  }
}
