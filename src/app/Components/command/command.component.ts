import {Component, Input, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {UpperCasePipe} from '@angular/common';
import {TooltipComponent} from '../tooltip/tooltip.component';
import {CommandData} from '../../app.component';

@Component({
  selector: 'app-command',
    imports: [
        UpperCasePipe,
        TooltipComponent
    ],
  templateUrl: './command.component.html',
  styleUrl: './command.component.scss'
})
export class CommandComponent {
    @Input() command!: CommandData;
    public sanitizedDescription: SafeHtml = '';
    public isHover: boolean  = false;
    public constructor(private sanitizer: DomSanitizer) {}

    public ngOnChanges(changes: SimpleChanges) {

        if (changes['command'] && this.command?.Description) {
            this.sanitizedDescription =  this.sanitizer.bypassSecurityTrustHtml( this.command?.Description.toUpperCase())
        }
    }

    show(b: boolean) {
        this.isHover = b;
    }
}
