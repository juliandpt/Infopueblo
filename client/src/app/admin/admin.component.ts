import { Router } from '@angular/router';
import { UsersService } from './../services/users.service';
import { Component, OnInit } from '@angular/core';
import { TownsService } from '../services/towns.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminComponent implements OnInit {
  admin: any
  users: any
  admins: any
  topWeekTowns: any
  topTowns: any
  searchedTowns: any
  noUsers: boolean = true
  chart: any

  loading: boolean = true

  areaChartOptions={};

  // highcharts
  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
  chartOptions: Highcharts.Options = { series: [{ data:[], type: 'line',  yAxis: 'y axis' }] }; // required optional function, defaults to null
  updateFlag: boolean = false; // optional boolean
  oneToOneFlag: boolean = true; // optional boolean, defaults to false
  runOutsideAngular: boolean = false; // optional boolean, defaults to false

  constructor(private userService: UsersService, private townService: TownsService, private router: Router) { }

  ngOnInit(): void {
    this.userService.getAdmin()
      .subscribe(
        response => {
          this.admin = response;
        }, 
        error => {
          this.router.navigate(['/'])
        })

    this.userService.getUsers()
      .subscribe(
        response => {
          this.noUsers = false
          this.users = response;
        },
        error => {
          this.noUsers = true
        })
        
    this.userService.getAdmins()
      .subscribe(
        response => {
          this.admins = response;
        })

    this.townService.getTopWeekTowns()
      .subscribe(
        response => {
          this.topWeekTowns = response;
        })

    this.townService.getTopLimitedTowns()
      .subscribe(
        response => {
          console.log(response)
          this.topTowns = response;
        })

    this.townService.getSearchedTowns()
      .subscribe(
        response => {
          this.searchedTowns = response
          this.chartOptions = {
            chart: {
              type: 'line',
              plotShadow: false
            },
            plotOptions: {
              series: {
                marker: {
                  enabled: false,
                }
              }
            },
            legend: {
              enabled: false,
            },
            credits: {
              enabled: false,
            },
            title: {
              text: 'Búsquedas en los últimos 7 dias',
            },
            yAxis: {
              visible: true
            },
            xAxis: {
                  visible: true,
                  categories: [
                    '7 días',
                    '6 días',
                    '5 días',
                    '4 días',
                    '3 días',
                    'Ayer',
                    'Hoy',
                  ],
                },
            series: [{
              data: this.searchedTowns.map(town => town.searches), 
              type: 'line',
            }]
          } 
          this.updateFlag = true
          this.loading = false
        })
  }

  deleteUser(id_user) {
    this.userService.deleteUser(id_user).subscribe()
    window.location.reload();
  }
  
  setAdmin(id_user) {
    this.userService.setAdmin(id_user).subscribe()
    window.location.reload();
  }
}
