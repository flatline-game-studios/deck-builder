import {Component, Input, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import {TooltipComponent} from '../tooltip/tooltip.component';
import {AutoFitTextDirective} from '../../directives/auto-fit-text.directive';
import {CardData} from '../../app.component';

@Component({
    standalone: true,
    selector: 'app-card',
    imports: [
        NgForOf,
        NgIf,
        AutoFitTextDirective,
        NgOptimizedImage,
        TooltipComponent,

    ],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss'
})
export class CardComponent {
    @Input() card: CardData = new CardData();

    public sanitizedDescriptions: SafeHtml[] = [];
    public sanitizedConditional: SafeHtml = '';
    public sanitizedConditionalDescriptions: SafeHtml[] = [];
    private processing: boolean = false;
    public showDownload: boolean = false;
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
        if(this.processing) return;
        this.processing = true;
        const element = document.getElementById(this.card.Code);
        if (!element) return;


        html2canvas(element, { backgroundColor: null, scale: 1.5, ignoreElements: (el) => el.classList?.contains('no-capture') ?? false, }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${this.card.Code.toLowerCase()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.processing = false;
        });
    }

    getColor(): string {

         if(this.card.Color.toLowerCase() === '#ffffffff') {
             return '#000000'
         }else {
                return '#FFFFFF'
         }
    }

    show(b: boolean) {
        this.showDownload = b;
    }
}
