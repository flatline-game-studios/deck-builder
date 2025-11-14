import {Component} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
// import {CardComponent} from './card/card.component';
// import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
// import * as LZString from 'lz-string';
// import {firstValueFrom} from 'rxjs';
// import {DriverComponent} from './driver/driver.component';
// import {CommandComponent} from './command/command.component';
import {FormsModule} from '@angular/forms';
import {LanguageComponent} from './Components/language/language.component';


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


export class Item {
    c: string = '' ;
    a: number = 0 ;
}

export class Run {
    totalLayers: number = 0 ;
    currentLayer: number = 0 ;
}

export class Trace {
    trace: number = 0 ;
    alarm: number = 0 ;
}

export class Query<T> {
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
    imports: [
        RouterOutlet,
        LanguageComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {



}
