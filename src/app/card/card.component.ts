import {Component, Input, SimpleChanges, OnChanges} from '@angular/core';
import {CardData} from '../app.component';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-card',
  imports: [
    NgForOf,
    NgIf
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
}
