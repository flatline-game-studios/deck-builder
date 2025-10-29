import {Component, Input, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {DriverData} from '../app.component';
import {NgIf} from '@angular/common';
@Component({
  selector: 'app-driver',
    imports: [
        NgIf
    ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss'
})
export class DriverComponent {
    @Input() driver: DriverData = new DriverData();
    public sanitizedDescription: SafeHtml = '';
    public imageSrc: string = '';

    public constructor(private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.imageSrc = `public/assets/output/${this.driver.ImagePath}`;
    }
    public ngOnChanges(changes: SimpleChanges) {

        if (changes['driver'] && this.driver?.Description) {
            this.sanitizedDescription =  this.sanitizer.bypassSecurityTrustHtml( this.driver?.Description.toUpperCase())
        }
    }

}
