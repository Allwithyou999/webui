import { MdDialogRef } from '@angular/material';
import { Component } from '@angular/core';

@Component({
  selector: 'theme-dialog',
  template: `
        <p>{{ title }}</p>
        <p>{{ message }}</p>
        <button md-raised-button
            (click)="dialogRef.close(true)">OK</button>
        <button md-button
            (click)="dialogRef.close(false)">Cancel</button>
    `,
})
export class ThemeDialog {

  public title: string;
  public message: string;

  constructor(public dialogRef: MdDialogRef < ThemeDialog > ) {

  }
}
