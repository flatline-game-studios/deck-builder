import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./Routes/share/share.component').then(m => m.ShareComponent)
    },
    {
        path: 'share',
        loadComponent: () => import('./Routes/share/share.component').then(m => m.ShareComponent)
    },
    {
        path:'all-cards',
        loadComponent: () => import('./Routes/all-cards/all-cards.component').then(m => m.AllCardsComponent)
    },
];
