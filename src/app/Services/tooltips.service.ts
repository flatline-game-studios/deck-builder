import { Injectable } from '@angular/core';
import {CardData, Response, Tooltip} from '../app.component';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TooltipsService {


    tooltips: Response<Tooltip> = new Response<Tooltip>();
    constructor(private http: HttpClient) { }

    public async LoadTooltips(language: string = 'en') {
        try {
            this.tooltips = await firstValueFrom(
                this.http.get<Response<Tooltip>>(`public/assets/json/tooltips_metadata_${language}.json`)
            );
        } catch (err) {
            console.error('HTTP error', err);
        }
    }

    public GetTooltips(search: string[]) : Array<Tooltip> {
        if (!this.tooltips || !this.tooltips.Items) {
            return [];
        }
        // console.log(this.tooltips.Items);
        return this.tooltips.Items.filter(item => {
            const key = item.Code;
            return search.includes(key);
        });
    }
}
