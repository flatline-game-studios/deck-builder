import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-language',
    imports: [
        NgForOf,
        NgIf
    ],
  templateUrl: './language.component.html',
  styleUrl: './language.component.scss'
})
export class LanguageComponent  {
    languages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'ko', label: '한국어' },
        { code: 'zh', label: '中文' },
        { code: 'zh-Hant', label: '繁體中文' },
        { code: 'ja', label: '日本語' }
    ];
    open = false;
    selected = 'en';
    selectLangDisplay: string = 'English';


    constructor(private el: ElementRef, private router: Router, private route: ActivatedRoute) {
        this.route.queryParamMap.subscribe(params => {
            this.selected = params.get('language') ?? this.selected;
            this.selectLangDisplay = this.languages.find(lang => lang.code === this.selected)?.label || 'English';
        });
    }

    onChange(lang: string): void {
        this.selected = lang;
        const query = lang ? { language: lang } : { language: 'en' };
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: query,
            queryParamsHandling: 'merge'
        });
    }
    toggle(): void {
        this.open = !this.open;
    }

    choose(lang: string): void {
        this.selected = lang;
        this.open = false;
        const query = lang ? { language: lang } : { language: null };
        this.router.navigate([], { relativeTo: this.route, queryParams: query, queryParamsHandling: 'merge' });
        this.selectLangDisplay = this.languages.find(lang => lang.code === this.selected)?.label || 'English';
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(e: Event): void {
        if (!this.el.nativeElement.contains(e.target)) {
            this.open = false;
        }
    }
}
