import {
  ApplicationRef,
  Component,
  Injector,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';
import {RestService, WebSocketService} from '../../../../services/';
import {
  FieldConfig
} from '../../../common/entity/entity-form/models/field-config.interface';

@Component({
  selector : 'app-alertservice-add-mattermost',
  template : `<entity-form [conf]="this"></entity-form>`
})
export class AlertServiceAddMattermostComponent {

  protected resource_name = 'system/consulalerts';
  protected route_success: string[] = [ 'system', 'alertservice'];
  protected isNew = true;
  protected isEntity = true;
  
  
  
  protected fieldConfig: FieldConfig[] = [
    {
      type : 'input',
      name : 'consulalert_type',
      placeholder: 'consulalert_type',
      value: 'Mattermost'
    },{
      type : 'input',
      name : 'username',
      placeholder: 'username'
    },{
      type : 'input',
      name : 'password',
      placeholder: 'password'
    },{
      type : 'input',
      name : 'cluster_name',
      placeholder: 'cluster_name'
    },{
      type : 'input',
      name : 'url',
      placeholder: 'url'
    },{
      type : 'input',
      name : 'channel',
      placeholder: 'channel'
    },{
      type : 'input',
      name : 'team',
      placeholder: 'team'
    },
    {
      type : 'checkbox',
      name : 'enabled',
      placeholder : 'Enabled'
    },
  ];

  constructor(
      protected router: Router,
      protected route: ActivatedRoute,
      protected rest: RestService,
      protected ws: WebSocketService,
      protected _injector: Injector,
      protected _appRef: ApplicationRef
  ) {}

  afterInit(entityAdd: any) {}
}
