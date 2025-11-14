// file: src/app/tooltip/tooltip.component.ts
import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    SimpleChanges,
    OnInit,
    OnDestroy,
    Renderer2,
    HostListener,
    ViewChild, SecurityContext
} from '@angular/core';

import {NgForOf, NgIf} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {Tooltip} from '../../app.component';
import {TooltipsService} from '../../Services/tooltips.service';

@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrl: './tooltip.component.scss',
    imports: [
        NgForOf,
        NgIf
    ],
})
export class TooltipComponent implements OnInit, OnChanges, OnDestroy {
    @Input() anchor!: HTMLElement;
    @Input() items: string[] = [];
    @Input() show: boolean = false;

    displayedTooltips: Tooltip[] = [];

    private containerEl?: HTMLElement;

    constructor(
        private tooltipService: TooltipsService,
        private host: ElementRef<HTMLElement>,
        private renderer: Renderer2,
        private sanitizer: DomSanitizer
    ) {}

    @ViewChild('tooltipContainer', { read: ElementRef }) set tooltipContainerRef(ref: ElementRef<HTMLElement> | null) {
        if (ref) {
            this.containerEl = ref.nativeElement;
            if (this.containerEl.parentNode !== document.body) {
                this.renderer.appendChild(document.body, this.containerEl);
            }
            this.renderer.setStyle(this.containerEl, 'position', 'absolute');
            this.renderer.setStyle(this.containerEl, 'z-index', '100000');
            this.renderer.removeStyle(this.containerEl, 'right');
            this.renderer.removeStyle(this.containerEl, 'top');
            if (this.show) this.updatePosition();
        } else {
            if (this.containerEl && this.containerEl.parentNode === document.body) {
                this.renderer.removeChild(document.body, this.containerEl);
            }
            this.containerEl = undefined;
        }
    }

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['items'] && this.items?.length > 0) {
            this.displayedTooltips = this.tooltipService.GetTooltips(this.items);
        } else if (changes['items'] && (!this.items || this.items.length === 0)) {
            this.displayedTooltips = [];
        }

        if (changes['show'] || changes['items'] || changes['anchor']) {
            if (this.show) {
                this.ensureContainerInBody();
                this.updatePosition();
                if (this.containerEl) {
                    this.renderer.removeStyle(this.containerEl, 'display');
                }
            } else {
                if (this.containerEl) {
                    this.renderer.setStyle(this.containerEl, 'display', 'none');
                }
            }
        }
    }

    ngOnDestroy(): void {
        if (this.containerEl && this.containerEl.parentNode === document.body) {
            this.renderer.removeChild(document.body, this.containerEl);
            this.containerEl = undefined;
        }
    }

    @HostListener('window:scroll')
    @HostListener('window:resize')
    onWindowChange(): void {
        if (this.show) {
            this.updatePosition();
        }
    }

    private ensureContainerInBody(): void {
        if (this.containerEl) return;

        const found = this.host.nativeElement.querySelector('.tooltip-container') as HTMLElement | null;
        if (!found) return;

        if (found.parentNode !== document.body) {
            this.renderer.appendChild(document.body, found);
        }

        this.renderer.setStyle(found, 'position', 'absolute');
        this.renderer.setStyle(found, 'z-index', '100000');
        this.renderer.removeStyle(found, 'right');
        this.renderer.removeStyle(found, 'top');
        this.containerEl = found;
    }

    private updatePosition(): void {
        if (!this.anchor || !this.show) return;
        if (!this.containerEl) {
            this.ensureContainerInBody();
            if (!this.containerEl) return;
        }

        const rect = this.anchor.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Alineado a la misma altura (top del ancla)
        const top = rect.top + scrollY;

        // Asegurar que el contenedor sea visible temporalmente para medirlo
        this.renderer.setStyle(this.containerEl, 'display', 'block');

        const tooltipRect = this.containerEl.getBoundingClientRect();
        const tooltipWidth = tooltipRect.width;

        const spaceRightFromAnchor = window.innerWidth - rect.right;
        const spaceLeftFromAnchor = rect.left;

        let computedLeft: number;

        // Colocar fuera del elemento: si hay más espacio a la derecha, lo colocamos
        // justo después del borde derecho del ancla; si no, lo colocamos justo
        // antes del borde izquierdo del ancla (fuera hacia la izquierda).
        if (spaceRightFromAnchor >= spaceLeftFromAnchor) {
            // Fuera a la derecha
            computedLeft = rect.right + scrollX;
            this.renderer.removeClass(this.containerEl, 'align-left');
            this.renderer.addClass(this.containerEl, 'align-right');
        } else {
            // Fuera a la izquierda
            computedLeft = rect.left + scrollX - tooltipWidth;
            this.renderer.removeClass(this.containerEl, 'align-right');
            this.renderer.addClass(this.containerEl, 'align-left');
        }

        // Clampeo para que no salga fuera del viewport horizontalmente
        const minLeft = window.scrollX || window.pageXOffset;
        const maxLeft = (window.innerWidth - tooltipWidth) + (window.scrollX || window.pageXOffset);
        computedLeft = Math.min(Math.max(computedLeft, minLeft), maxLeft);

        // Aplicar posicionamiento
        this.renderer.setStyle(this.containerEl, 'left', `${Math.round(computedLeft)}px`);
        this.renderer.setStyle(this.containerEl, 'top', `${Math.round(top)}px`);
    }

    sanitizeHtml(html: string | null | undefined): string {
        if (!html) return '';
        return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    }
}
