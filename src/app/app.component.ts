import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CardComponent} from './card/card.component';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import * as LZString from 'lz-string';
import {firstValueFrom} from 'rxjs';
import {DriverComponent} from './driver/driver.component';


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
}

export class DriverData {
    DriverName: string = '';
    Description: string = '';
    ImagePath: string = '';
    Code: string = '';
    Color: string = "";
}



class Response<T> {
  Items: Array<T> = [] ;
}


class Item {
    c: string = '' ;
    a: number = 0 ;
}

class Query<T> {
    i: Array<T> = [] ;
    d: Array<string> = [];
}


@Component({
  selector: 'app-root',
    imports: [CardComponent, CommonModule, DriverComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'deck-builder';
  cards: Response<CardData> = new Response<CardData>();
  drivers: Response<DriverData> = new Response<DriverData>();
  showCards : Array<CardData> = [];
  showDrivers : Array<DriverData> = [];
  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {

  }

  public async ngOnInit() {


      await Promise.all([this.LoadCards(), this.LoadDrivers()]);

      this.route.queryParams.subscribe(params => {
          const myParam = params['d'];
          const query = this.decodeFromQuery(myParam);
          this.ParseData(query)
      });

  }

    public ParseData(elements: Query<Item>): void {

        elements.i.forEach( (item) => {
            const card = this.cards.Items.find(c => c.Code === item.c);

            for (let i = 0; i < item.a; i++) {
                if (card) {
                    this.showCards.push(card);
                }
            }
        });

        elements.d.forEach( (item) => {
            console.log('Driver code', item);
            const driver = this.drivers.Items.find(c => c.Code === item);

                if (driver) {
                    this.showDrivers.push(driver);
                }

        });

        console.log(this.showDrivers)
    }


    public async LoadCards(): Promise<void> {
        try {
            this.cards = await firstValueFrom(
                this.http.get<Response<CardData>>('public/assets/output/cards_metadata.json')
            );
        } catch (err) {
            console.error('HTTP error', err);
        }
    }

    private async LoadDrivers() {
        try {
            this.drivers = await firstValueFrom(
                this.http.get<Response<DriverData>>('public/assets/output/drivers_metadata.json')
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
            return { i: [], d: [] };
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
