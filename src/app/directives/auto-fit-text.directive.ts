// typescript
// File: `src/app/directives/auto-fit-text.directive.ts`
import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
    selector: '[autoFitText],[autofittext],[auto-fit-text]',
    standalone: true
})
export class AutoFitTextDirective implements AfterViewInit, OnDestroy {
    @Input() minFont = 10;
    @Input() step = 1;

    private originalFont = 0;
    private ro?: ResizeObserver;
    private mo?: MutationObserver;
    private destroyed = false;
    private triedDisplayFix = false;

    constructor(private elRef: ElementRef<HTMLElement>) {}

    ngAfterViewInit(): void {
        const el = this.elRef.nativeElement;
        const style = window.getComputedStyle(el);
        this.originalFont = parseFloat(style.fontSize) || 16;

        // permitir medición en inline/inline-flex/flex context
        if (style.display === 'inline' || style.display === 'inline-block' || style.display === 'flex') {
            el.style.display = 'inline-block';
            this.triedDisplayFix = true;
        }

        // permitir que el elemento reduzca su ancho dentro de un contenedor flex
        // (evita que el padre impida el shrink)
        el.style.minWidth = '0';

        // sólo forzamos white-space; overflow/ellipsis se aplican después de medir
        el.style.whiteSpace = 'nowrap';

        this.tryAdjustUntilReady();

        if ('ResizeObserver' in window) {
            this.ro = new ResizeObserver(() => this.adjustSafe());
            this.ro.observe(el);
        }

        this.mo = new MutationObserver(() => this.adjustSafe());
        this.mo.observe(el, { childList: true, subtree: true, characterData: true });
    }

    ngOnDestroy(): void {
        this.destroyed = true;
        this.ro?.disconnect();
        this.mo?.disconnect();
        if (this.triedDisplayFix) {
            this.elRef.nativeElement.style.display = '';
        }
    }

    private tryAdjustUntilReady(attempt = 0) {
        if (this.destroyed) return;
        const el = this.elRef.nativeElement;

        if (el.clientWidth === 0 && attempt < 12) {
            requestAnimationFrame(() => this.tryAdjustUntilReady(attempt + 1));
            return;
        }

        // restablecer tamaño original antes de ajustar
        el.style.fontSize = this.originalFont + 'px';

        // sólo activar overflow/ellipsis si el elemento ya tiene ancho
        if (el.clientWidth > 0) {
            // el.style.overflow = 'hidden';
            (el.style as any).textOverflow = 'ellipsis';
        }

        this.adjustSafe();
    }

    private adjustSafe() {
        if (this.destroyed) return;
        requestAnimationFrame(() => this.adjust());
    }

    private adjust() {
        const el = this.elRef.nativeElement;
        if (!el || el.clientWidth === 0) return;

        let font = parseFloat(window.getComputedStyle(el).fontSize) || this.originalFont;
        let iter = 0;
        while (el.scrollWidth > el.clientWidth && font > this.minFont && iter++ < 200) {
            font = Math.max(font - this.step, this.minFont);
            el.style.fontSize = font + 'px';
        }
    }
}
