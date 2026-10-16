
import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup.component';

import { EmployeeComponent } from './components/employee/employee.component';
import { EmployeeListPageComponent } from './components/employee-list-page/employee-list-page.component';
import { EmployeeTablePageComponent } from './components/employee-table-page/employee-table-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HelpComponent } from './components/help/help.component';
import { AboutComponent } from './components/about/about.component';
import { AccessManagementComponent } from './components/access-management/access-management.component';
import { authGuard } from './Guards/auth.guard';
import { adminGuard } from './Guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'signup',
    component: SignupComponent,
  },

  {
    path: 'employees',
    component: EmployeeComponent,
    canActivate: [authGuard],

    children: [
      {
        path: '',
        redirectTo: 'table',
        pathMatch: 'full',
      },
      {
        path: 'table',
        component: EmployeeTablePageComponent,
      },
      {
        path: 'list',
        component: EmployeeListPageComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
},
      {
        path: 'list/:employeeId',
        component: EmployeeListPageComponent,
      },
      {
        path: 'help',
        component: HelpComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'access-management',
        component: AccessManagementComponent,
        canActivate: [adminGuard],
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
