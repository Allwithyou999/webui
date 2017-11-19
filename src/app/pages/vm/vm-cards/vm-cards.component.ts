import { Component, OnInit, AfterViewInit, Input, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { CoreService, CoreEvent } from '../../../services/core/core.service';
import { Router } from '@angular/router';
//import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule, MdButtonToggleGroup } from '@angular/material';
import { EntityModule } from '../../common/entity/entity.module';
import { WebSocketService, RestService } from '../../../services/';
import { DialogService } from '../../../services/dialog.service';
import { AppLoaderService } from '../../../services/app-loader/app-loader.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';


interface VmProfile {
  name?:string;
  id?:string;
  description?:string;
  info?:string;
  bootloader?:string;
  state?:string;
  autostart?:string;
  vcpus?:string;
  memory?:string;
  lazyLoaded?:boolean;
  template?:string; // for back face of card
  cardActions?:Array<any>;
  isNew:boolean;
}

@Component({
  selector: 'vm-cards',
  templateUrl: './vm-cards.component.html',
  styleUrls: ['./vm-cards.component.css']
})
export class VmCardsComponent implements OnInit {

  @ViewChild('filter') filter: ElementRef;
  @Input() searchTerm:string = '';
  @Input() cards = []; // Display List
  @Input() cache = []; // Master List: 
  @ViewChild('viewMode') viewMode:MdButtonToggleGroup;
  
  private init:boolean = true;
  public tpl = "edit";
  private pwrBtnLabel: string;
  private pwrBtnOptions = {
    stopped: "Start VM",
    running: "Stop VM"
  }
  protected loaderOpen: boolean = false;

  constructor(protected core: CoreService, protected ws: WebSocketService,protected rest: RestService, private dialog: DialogService,protected loader: AppLoaderService,protected router: Router){}

  ngOnInit() {

    /* 
     * Register the component with the EventBus 
     * and subscribe to the observable it returns
     */
    this.core.register({observerClass:this, eventName:"VmProfiles"}).subscribe((evt: CoreEvent) => { this.setVmList(evt); });
    this.core.register({observerClass:this, eventName:"VmProfile"}).subscribe((evt: CoreEvent) => { this.setVm(evt); });
    this.core.register({observerClass:this, eventName:"VmStarted"}).subscribe((evt:CoreEvent) => { this.updateVmModelState(evt.data); });
    this.core.register({observerClass:this, eventName:"VmStopped"}).subscribe((evt:CoreEvent) => { this.updateVmModelState(evt.data); });

    this.getVmList();
    this.viewMode.value = "cards";
  }

  displayAll(){
    for(var i = 0; i < this.cache.length; i++){
      this.cards[i] = Object.assign({}, this.cache[i]);
    }
  }

  displayFilter(key,query?){
    console.log(key + '/' + query);
    if(query == '' || !query){
      this.displayAll();
    } else {
      this.cards = this.cache.filter((card) => {
	console.log(card[key]);
	var result = card[key].toLowerCase().indexOf(query.toLowerCase()) > -1;
	//if(result !== -1){ 
	console.log(result)
	return result;
	//}
      });
      console.log("**** this.display ****");
      console.log(this.cards);
    }
  }

  parseResponse(data){
    //Temporary Workaround Until Middleware adds state property
    if(!data.state){
      data.state = "STOPPED";
    }
    var card: VmProfile = { 
      name:data.name,
      id:data.id,
      description:data.description,
      info:data.info,
      bootloader:data.bootloader,
      state:data.state.toLowerCase(),
      autostart:data.autostart,
      vcpus:data.vcpus,
      memory:data.memory,
      lazyLoaded: false,
      template:'none',
      isNew:false
    }   
    return card;
  }

  getVmList(){
    this.core.emit({name:"VmProfilesRequest"})
  }
  setVmList(evt: CoreEvent) {
    console.log("SETVMLIST: CoreEvent Received");
    console.log(evt);
    let data:any;
    if(evt.data){
      data = evt.data;
    } else{
      data = [];
    }
      for(var i = 0; i < data.length; i++){
	var card = this.parseResponse(data[i]);
	//console.log(card);
	this.cache.push(card);
	this.pwrBtnLabel = this.pwrBtnOptions[this.cache[i].state];
      }   
      if(this.init){
	this.displayAll()
	this.init = false;
      }
  }

  getVm(index,id?:any) {
    if(this.cards[index].isNew && id){
      console.log(id);
      this.cards[index].isNew = false;
      this.cards[index].id = id;
    } 
    
    if(!id){ id = this.cards[index].id}
    console.log("GETVM:");
    console.log(this.cards[index]);
    this.core.emit({
      name:"VmProfileRequest", 
      data:[[[ 'id', '=',  String(id) ]], {"get": true}]
    });
  }
  setVm(evt:CoreEvent) {
    let data = evt.data;
    let card = this.parseResponse(data);
    let index;
    for(var i = 0; i < this.cards.length; i++){
      if(card.id == this.cards[i].id){
	index = i;
	break;
      }
    }

    for(var prop in data){
      this.cards[index][prop] = card[prop];
    }
    console.log(index);
      this.updateCache();
  }

  updateCache(){
    this.cache = [];
    this.getVmList();
  }

  refreshVM(index,id:any){
      this.getVm(index,id);
  }


  addVM(){
    let index = this.cards.length;
    let card: VmProfile = { 
      name:"",
      description:"",
      info:"",
      bootloader:"",
      state:"",
      autostart:"",
      vcpus:"",
      memory:"",
      lazyLoaded: false,
      template:'',
      isNew:true
    }
    this.cards.push(card);
    this.toggleForm(true,this.cards[index],'edit');
  }


  deleteVM(index) {
    this.dialog.confirm("Delete", "Are you sure you want to delete " + this.cards[index].name + "?").subscribe((res) => {
      if (res) {
	this.loader.open();
	this.loaderOpen = true;
	let data = {};
	this.rest.delete( 'vm/vm/' + this.cards[index].id, {}).subscribe(
	  (res) => {
	    this.cards.splice(index,1);
	    this.loader.close();
	    this.updateCache();
	  }/*,
	  (res) => { 
	    new EntityUtils().handleError(this, res);
	    this.loader.close(); 
	  }*/
	);        
      }
    })
  }

  cancel(index){
    let card = this.cards[index];
    if(card.isNew){
      this.cards.splice(index,1);
      this.updateCache();
    } else {
      this.toggleForm(false,card,'none')
    }

  }

  focusVM(index){
    for(var i = 0; i < this.cards.length; i++){
      if(i !== index && this.cards[i].isFlipped ){
	//console.log("Index = " + index + " && i = " + i);
	this.cards[i].isFlipped = false;
	this.cards[i].lazyLoaded = false;
	this.cards[i].template = 'none';
      }
    }
  }

  goToDevices(index){
    this.router.navigate(
      new Array('').concat([ "vm", this.cards[index].id, "devices", this.cards[index].name ])
    );
  }

  toggleForm(flipState, card, template){
    // load #cardBack template with code here
    //console.log(flipState);
    card.template = template;
    card.isFlipped = flipState;
    card.lazyLoaded = !card.lazyLoaded;
    var index = this.cards.indexOf(card);
    this.focusVM(index);
  }

  // toggles VM on/off (The UI elements shouldn't trigger this directly)
  toggleVmState(index){
    let vm = this.cards[index];
    let eventName: string;
    if (vm.state != 'RUNNING') {
      eventName = 'VmStartRequest';
    } else {
      eventName = 'VmStopRequest';
    }

    this.core.emit({ name:eventName , data: [ vm.id ] });

    /*let action: string;
    let rpc: string;
    if (vm.state != 'RUNNING') {
      rpc = 'vm.start';
    } else {
      rpc = 'vm.stop';
    }
    this.ws.call(rpc, [ vm.id ]).subscribe((res) => {
      console.log(this.cards[index].state);
      this.refreshVM(index,vm.id);
      this.pwrBtnLabel = this.pwrBtnOptions[this.cards[index].state];
    });*/
  }

  updateVmModelState(data){
    // Middleware returns a boolean. UI requires more VM data
      let id = 0;
      if(!data){
	console.log("Response data = " + data);
      }

      console.log("UPDATE_VM_MODEL:");
      console.log(data);

      let index = this.getViewIndexById(id);
      console.log(this.cards[index].state);
      this.refreshVM(index,id);
      this.pwrBtnLabel = this.pwrBtnOptions[this.cards[index].state];
  }

  getViewIndexById(id){
    for(var i = 0; i < this.cards.length; i++){
      if(this.cards[i].id == id){
	return i;
      }
    }
  }

  vnc(index){
    var vm = this.cards[index];
    this.ws.call('vm.get_vnc_web', [ vm.id ]).subscribe((res) => {
      for (let item in res){
	window.open(res[item]);
      }   
    }); 
  }
}
