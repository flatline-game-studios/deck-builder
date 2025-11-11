import {Component} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {CardComponent} from './card/card.component';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import * as LZString from 'lz-string';
import {firstValueFrom} from 'rxjs';
import {DriverComponent} from './driver/driver.component';
import {CommandComponent} from './command/command.component';
import {FormsModule} from '@angular/forms';
import { map, distinctUntilChanged, switchMap, filter, take } from 'rxjs/operators';
import {TooltipsService} from './Services/tooltips.service';

export class CardData {
    CardName: string = '';
    ImagePath: string = '';
    Code: string = '';
    Descriptions: Array<string> = [ ];
    Conditional: string = '';
    ConditionalDescriptions: Array<string> = [ ];
    Rarity: string = '';
    Color: string = '';
    Clock: number = 0;
    Type: string = '';
    Vim: number = 0;
    IsUpgrade: boolean = false;
    Tooltips: Array<string> = [];
}

export class DriverData {
    DriverName: string = '';
    Description: string = '';
    ImagePath: string = '';
    ImageIcon: string = '';
    Code: string = '';
    Color: string = "";
    Tooltips: Array<string> = [];
}

export class CommandData {
    CommandName: string = '';
    Description: string = '';
    Code: string = '';
    Cost: number = 0;
    Tier: string = "";
    Tooltips: Array<string> = [];
}

export class Tooltip {
    Title: string = '';
    Description: string = '';
    Code: string = '';
}




export class Response<T> {
    Items: Array<T> = [] ;
}


class Item {
    c: string = '' ;
    a: number = 0 ;
}

class Run {
    totalLayers: number = 0 ;
    currentLayer: number = 0 ;
}

class Trace {
    trace: number = 0 ;
    alarm: number = 0 ;
}

class Query<T> {
    i: Array<T> = [] ;
    d: Array<string> = [];
    c: Array<string> = [];
    m: string = '';
    s: string = '';
    r: Run = new Run();
    t: Trace = new Trace();
}


@Component({
    selector: 'app-root',
    imports: [CardComponent, CommonModule, DriverComponent, CommandComponent, FormsModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
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




        this.router.events
            .pipe(
                filter(e => e instanceof NavigationEnd),
                take(1),
                switchMap(() =>
                    this.route.queryParams.pipe(
                        map(params => ({ d: params['d'], language: params['language'] })),
                        distinctUntilChanged((a, b) => a.d === b.d && a.language === b.language),
                        switchMap(async ({ d, language }) => {
                            await Promise.all([this.LoadCards(language), this.LoadDrivers(language), this.LoadCommands(language), this.tooltipService.LoadTooltips(language)]);
                            // if (!d) {
                            //     this.showCards = this.GetCards();
                            //     this.showDrivers = this.drivers.Items;
                            //     this.showCommands = this.commands.Items;
                            // }
                            this.query = this.decodeFromQuery(d);
                            console.log('Decoded query:', this.query);
                            this.ParseData(this.query);
                        })
                    )
                )
            )
            .subscribe();

    }

    public onSearch(): void {
        const filteredCards = this.GetCards().filter(card =>
            card.CardName.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

        // const filteredDrivers = this.drivers.Items.filter(driver =>
        //     driver.DriverName.toLowerCase().includes(this.searchTerm.toLowerCase())
        // );
        //
        // const filteredCommands = this.commands.Items.filter(command =>
        //     command.CommandName.toLowerCase().includes(this.searchTerm.toLowerCase())
        // );

        this.showCards = filteredCards;
        // this.showDrivers = filteredDrivers;
        // this.showCommands = filteredCommands;
    }

    public ParseData(elements: Query<Item>): void {

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

    private async LoadTooltips(language: string = 'en') {
        try {
            this.commands = await firstValueFrom(
                this.http.get<Response<CommandData>>(`public/assets/json/tooltips_metadata_${language}.json`)
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
