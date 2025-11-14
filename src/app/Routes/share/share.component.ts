// src/app/Routes/share/share.component.ts
import { Component } from '@angular/core';
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {TooltipsService} from '../../Services/tooltips.service';
import {distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {firstValueFrom} from 'rxjs';
import * as LZString from 'lz-string';
import {CardData, CommandData, DriverData, Item, Query, Response, Run, Trace} from '../../app.component';
import {FormsModule} from '@angular/forms';
import {CommandComponent} from '../../Components/command/command.component';
import {DriverComponent} from '../../Components/driver/driver.component';
import {CardComponent} from '../../Components/card/card.component';

@Component({
    selector: 'app-share',
    imports: [
        NgForOf,
        NgIf,
        CardComponent, CommonModule, DriverComponent, CommandComponent, FormsModule
    ],
    templateUrl: './share.component.html',
    styleUrl: './share.component.scss'
})
export class ShareComponent {
    query: Query<Item> = { i: [], d: [], c: [], m: '', s: '', r: new Run(), t: new Trace() };
    searchTerm: string = '';
    cards: Response<CardData> = new Response<CardData>();
    drivers: Response<DriverData> = new Response<DriverData>();
    commands: Response<CommandData> = new Response<CommandData>();
    showCards : Array<CardData> = [];
    showDrivers : Array<DriverData> = [];
    showCommands: Array<CommandData> = [];
    constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private  tooltipService: TooltipsService) {

    }

    public async ngOnInit() {

        console.log("detecting query params...");
        const params$ = this.route.queryParams;

        // Cuando cambie solo el lenguaje, recargar ficheros relacionados
        params$
            .pipe(
                map(p => p['language'] ?? 'en'),
                distinctUntilChanged()
            )
            .subscribe(async language => {
                console.log('Language:', language);
                await this.reloadForLanguage(language);
                this.ParseData(this.query);
            });

        // Cuando cambie solo el 'd' decodificar y parsear
        params$
            .pipe(
                map(p => p['d'] ?? null),
                distinctUntilChanged()
            )
            .subscribe(d => {
                this.query = this.decodeFromQuery(d);
                this.ParseData(this.query);
            });
    }

    private async reloadForLanguage(language: string = 'en'): Promise<void> {
        try {
            await Promise.all([
                this.LoadCards(language),
                this.LoadDrivers(language),
                this.LoadCommands(language),
                this.tooltipService.LoadTooltips(language)
            ]);
        } catch (err) {
            console.error('Error cargando recursos por language', err);
        }
    }

    public ParseData(elements: Query<Item>): void {
        // limpiar resultados previos para evitar duplicados cuando se re-ejecuta
        this.showCards = [];
        this.showDrivers = [];
        this.showCommands = [];

        elements.i.forEach( (item) => {
            const card = this.GetCards().find(c => c.Code === item.c);

            for (let i = 0; i < item.a; i++) {
                if (card) {
                    this.showCards.push(card);
                }
            }
        });

        elements.d.forEach( (item) => {
            const driver = this.drivers.Items.find(c => c.Code === item);

            if (driver) {
                this.showDrivers.push(driver);
            }

        });

        elements.c.forEach( (item) => {
            const command = this.commands.Items.find(c => c.Code === item);

            if (command) {
                this.showCommands.push(command);
            }

        });

    }

    public  GetCards() : Array<CardData> {
        if (!this.cards || !this.cards.Items) {
            return [];
        }

        return this.cards.Items.filter(item => {
            const name = (item.CardName || '').toLowerCase().trim();
            const imageLen = (item.ImagePath || '').length;
            const codeLen = (item.Code || '').length;

            return name !== 'null' && imageLen > 0 && codeLen > 0;
        });
    }

    public async LoadCards(language: string = 'en'): Promise<void> {
        try {
            this.cards = await firstValueFrom(
                this.http.get<Response<CardData>>(`public/assets/json/cards_metadata_${language}.json`)
            );
        } catch (err) {
            console.error('HTTP error', err);
        }
    }

    private async LoadDrivers(language: string = 'en') {
        try {
            this.drivers = await firstValueFrom(
                this.http.get<Response<DriverData>>(`public/assets/json/drivers_metadata_${language}.json`)
            );
        } catch (err) {
            console.error('HTTP error', err);
        }
    }

    private async LoadCommands(language: string = 'en') {
        try {
            this.commands = await firstValueFrom(
                this.http.get<Response<CommandData>>(`public/assets/json/commands_metadata_${language}.json`)
            );
        } catch (err) {
            console.error('HTTP error', err);
        }
    }


    // Convierte objeto -> string compacto y comprimido, seguro para query params
    public encodeForQuery(obj: any): string {
        const json = JSON.stringify(obj); // ya viene minificado sin espacios innecesarios
        return LZString.compressToEncodedURIComponent(json);
    }

    // Convierte la cadena de query -> objeto (o null si no se puede)

    public decodeFromQuery(q?: string | null): Query<Item> {
        if (!q) {
            return { i: [], d: [], c: [] , m: '', s: '', r: new Run(), t: new Trace() };
        }
        const decompressed = LZString.decompressFromEncodedURIComponent(q);
        return decompressed ? JSON.parse(decompressed) : null;
    }

    public setDataInQuery(obj: any) {
        const encoded = this.encodeForQuery(obj);
        this.router.navigate([], {
            queryParams: { d: encoded },
            queryParamsHandling: 'merge'
        });
    }
}
