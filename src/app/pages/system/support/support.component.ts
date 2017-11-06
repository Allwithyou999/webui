import { ApplicationRef, Component, Injector} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RestService, WebSocketService } from '../../../services/';
import { EntityJobComponent } from '../../common/entity/entity-job/entity-job.component';
import {MdDialog} from '@angular/material';

@Component({
  selector : 'app-support',
  templateUrl : './support.component.html',
  styleUrls : [ './support.component.css' ],
})

export class SupportComponent {
  username: any;
  password: any;
  categories: any;
  attach_debug: any;
  title: any;
  body: any;
  type: any;
  category: any;
  attachment: File;
  payload = {};
  busy: Subscription;
  isAttachmentValid: boolean = true;

  constructor(protected router: Router, protected rest: RestService,
              protected ws: WebSocketService, protected _injector: Injector,
              protected _appRef: ApplicationRef, protected dialog: MdDialog)
              {
              }

  onSubmit(): void{
    this.payload['username'] = this.username;
    this.payload['password'] = this.password;
    this.payload['category'] = this.category;
    this.payload['attach_debug'] = this.attach_debug;
    this.payload['title'] = this.title;
    this.payload['body'] = this.body;
    this.payload['type'] = this.type;
    this.payload['attachment'] = this.attachment;

    this.openDialog();
  };

  openDialog() {
    console.log('this si the pat ====> ', this.payload);
    // let dialogRef = this.dialog.open(EntityJobComponent, {data: {"title":"Update"}});
    // dialogRef.componentInstance.setCall('support.new_ticket', [this.payload]);
    // dialogRef.componentInstance.submit();
  }

  onBlurMethod(){
    if (this.username !== '' && this.password !== '') {
      this.ws.call('support.fetch_categories',[this.username,this.password]).subscribe((res) => {
        this.categories = [];
        for (let property in res) {
          if (res.hasOwnProperty(property)) {
            this.categories.push({label : property, value : res[property]});
          }
        }
      });
    } else {
      console.log("please enter valid email address");
    }
  }


  selectFile(event: any) {
    const fileList: File[] = event.target.files;
    this.attachment = fileList[0];
    this.isAttachmentValid = this.attachment.size < 20000000;

  }
}
