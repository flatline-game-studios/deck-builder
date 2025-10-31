import {Component, Input, SimpleChanges} from '@angular/core';
import {CardData} from '../app.component';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import { AutoFitTextDirective } from '../directives/auto-fit-text.directive';

@Component({
    standalone: true,
    selector: 'app-card',
    imports: [
        NgForOf,
        NgIf,
        AutoFitTextDirective,
        NgOptimizedImage
    ],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss'
})
export class CardComponent {
    @Input() card: CardData = new CardData();

    public sanitizedDescriptions: SafeHtml[] = [];
    public sanitizedConditional: SafeHtml = '';
    public sanitizedConditionalDescriptions: SafeHtml[] = [];
    public constructor(private sanitizer: DomSanitizer) {}

    public ngOnChanges(changes: SimpleChanges) {

        if (changes['card'] && this.card?.Descriptions) {
            this.sanitizedDescriptions = this.card.Descriptions.map((r: string) =>
                this.sanitizer.bypassSecurityTrustHtml(r.toUpperCase())
            );
        }

        if (changes['card'] && this.card?.Conditional) {
            this.sanitizedConditional =  this.sanitizer.bypassSecurityTrustHtml(this.card?.Conditional.toUpperCase())
        }

        if (changes['card'] && this.card?.ConditionalDescriptions) {
            this.sanitizedConditionalDescriptions = this.card.ConditionalDescriptions.map((r: string) =>
                this.sanitizer.bypassSecurityTrustHtml(r.toUpperCase())
            );
        }
    }

    protected readonly CardData = CardData;

    public get vimArray(): any[] {
        const n = this.card?.Vim ?? 0;
        return Array.from({ length: n });
    }

    saveAsImage() {
        // console.log('Saving card as image:', this.card.Code);
        // const element = document.getElementById(this.card.Code);
        // if (!element) return;
        // console.log('Element found:', element);
        // html2canvas(element, { backgroundColor: null, scale: 1 }).then(canvas => {
        //     const link = document.createElement('a');
        //     link.download = 'mi_captura.png';
        //     link.href = canvas.toDataURL('image/png');
        //     link.click();
        // });
    }

    getColor(): string {

         if(this.card.Color.toLowerCase() === '#ffffffff') {
             return '#000000'
         }else {
                return '#FFFFFF'
         }
    }
}
