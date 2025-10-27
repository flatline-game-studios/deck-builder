import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CardComponent} from './card/card.component';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import * as LZString from 'lz-string';
import {firstValueFrom} from 'rxjs';


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


class Response<T> {
  Items: Array<T> = [] ;
}


class Item {
    c: string = '' ;
    a: number = 0 ;
}

class Query<T> {
    i: Array<T> = [] ;
}


@Component({
  selector: 'app-root',
  imports: [CardComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'deck-builder';
  data: Response<CardData> = new Response<CardData>();
  showCards : Array<CardData> = [];
  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {

  }

  public async ngOnInit() {

      // this.setDataInQuery({
      //     "i": [
      //         {
      //             "c": "AFTERSHOCK_UPGRADED",
      //             "a": 3
      //         },
      //
      //         {
      //             "c": "CODESLASH",
      //             "a": 3
      //         }
      //     ]
      // });

      await this.loadData();

      this.route.queryParams.subscribe(params => {
          console.log('query params (subscribe):', params);
           const myParam = params['d'];
           console.log(myParam);
          const a = this.decodeFromQuery(myParam);

            console.log('decoded from query (subscribe):', a);

          this.ParseCards(a)

      });

      // const q = this.route.snapshot.queryParamMap.get('d');
      // const data = this.decodeFromQuery(q);
      // console.log('decoded from query:', data);


      // console.log("llego", this.data);
  }

    public ParseCards(elements: Query<Item>): void {
        this.showCards = [];
        elements.i.forEach( (item) => {
            const card = this.data.Items.find( c => c.Code === item.c);

            for (let i = 0; i < item.a; i++) {
                if (card) {
                    this.showCards.push(card);
                }
            }
        });
    }


    public async loadData(): Promise<void> {
        try {
            this.data = await firstValueFrom(
                this.http.get<Response<CardData>>('public/assets/output/cards_metadata.json')
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
            return { i: [] };
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
