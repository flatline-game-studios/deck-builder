import {Component, Input, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {DriverData} from '../app.component';
import {NgIf} from '@angular/common';
import {TooltipComponent} from '../tooltip/tooltip.component';
@Component({
  selector: 'app-driver',
    imports: [
        NgIf,
        TooltipComponent
    ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss'
})
export class DriverComponent {
    @Input() driver: DriverData = new DriverData();
    public sanitizedDescription: SafeHtml = '';
    public imageSrc: string = '';
    public imageIcon: string = '';
    public isHover: boolean  = false;

    public constructor(private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.imageSrc = `public/assets/output/${this.driver.ImagePath}`;
        this.imageIcon = `public/assets/output/${this.driver.ImageIcon}`;
    }
    public ngOnChanges(changes: SimpleChanges) {

        if (changes['driver'] && this.driver?.Description) {
            this.sanitizedDescription =  this.sanitizer.bypassSecurityTrustHtml( this.driver?.Description.toUpperCase())
        }
    }

    show(b: boolean) {
        this.isHover = b;
    }
}
