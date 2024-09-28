import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OthersComponent } from './others/others.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    {path:"",component:HomeComponent,pathMatch:'full'},
    {path:"others",component:OthersComponent},
    {path:"dashboard",component:DashboardComponent}
];
