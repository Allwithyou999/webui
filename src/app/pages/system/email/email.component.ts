import { ApplicationRef, Component, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { RestService, UserService, WebSocketService } from '../../../services/';
import { FieldConfig } from '../../common/entity/entity-form/models/field-config.interface';
import { matchOtherValidator } from '../../common/entity/entity-form/validators/password-validation';

@Component({
  selector: 'app-system-dataset',
  templateUrl: './email.component.html'
})
export class EmailComponent {

  protected resource_name: string = 'system/email';

  public fieldConfig: FieldConfig[] = [{
    type: 'input',
    name: 'em_fromemail',
    placeholder: 'From Email',
    tooltip: 'An email address that the system will use for the sending address for mail it sends, eg: freenas@example.com',
  }, {
    type: 'input',
    name: 'em_outgoingserver',
    placeholder: 'Outgoing mail server',
    tooltip: 'A hostname or ip that will accept our mail, for instance mail.example.org, or 192.168.1.1'
  }, {
    type: 'input',
    name: 'em_port',
    placeholder: 'Port',
    tooltip: 'An integer from 1 - 65535, generally will be 25, 465, or 587'
  }, {
    type: 'select',
    name: 'em_security',
    placeholder: 'TLS/SSL',
    tooltip: 'encryption of the connection',
    options: [
      { label: 'Plain', value: 'plain' },
      { label: 'HTTP', value: 'HTTP' },
      { label: 'HTTPS', value: 'HTTPS' },
    ],
  }, {
    type: 'checkbox',
    name: 'em_smtp',
    placeholder: 'Use SMTP Authentication',
    tooltip: 'Check this to redirect <i>HTTP</i> connections to\
 <i>HTTPS</i>. <i>HTTPS</i> must be selected in <b>Protocol</b>.'
  }, {
      type : 'input',
      name : 'em_user',
      placeholder : 'Username',
      tooltip: 'A username to authenticate to the remote server'
    }, {
      type : 'input',
      name : 'em_pass',
      placeholder : 'Password',
      inputType : 'password'
    },
    {
      type : 'input',
      name : 'bsdusr_password_conf',
      placeholder : 'Confirm Password',
      inputType : 'password',
      tooltip: 'Enter the same password as above, for verification.',
      validation : [ matchOtherValidator('em_pass') ]

    },];

  constructor(private rest: RestService, private ws: WebSocketService) {}

  sendTestMail(){
    this.ws.call("mail.send",[{'subject': 'test', 'text':' this is a test mail','to': 'xt@ixsystems.com', 'cc': ''},{}]).subscribe((res) => {
      console.log(res);
    })
  }
}
