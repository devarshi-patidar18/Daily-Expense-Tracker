import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OthersComponent } from './others/others.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    {path:"transactions",component:HomeComponent},
    {path:"others",component:OthersComponent},
    {path:"",component:DashboardComponent}
];
