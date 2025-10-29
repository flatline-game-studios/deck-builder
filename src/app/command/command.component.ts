import {Component, Input, SimpleChanges} from '@angular/core';
import {CommandData} from '../app.component';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-command',
    imports: [
        UpperCasePipe
    ],
  templateUrl: './command.component.html',
  styleUrl: './command.component.scss'
})
export class CommandComponent {
    @Input() command!: CommandData;
    public sanitizedDescription: SafeHtml = '';
    public constructor(private sanitizer: DomSanitizer) {}

    public ngOnChanges(changes: SimpleChanges) {

        if (changes['command'] && this.command?.Description) {
            this.sanitizedDescription =  this.sanitizer.bypassSecurityTrustHtml( this.command?.Description.toUpperCase())
        }
    }

}
