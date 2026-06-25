import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { Loading } from './components/loading/loading';

@NgModule({
  declarations: [DashboardLayoutComponent, SidebarComponent, NavbarComponent, Loading],
  imports: [CommonModule, DashboardRoutingModule],
})
export class DashboardModule {}
