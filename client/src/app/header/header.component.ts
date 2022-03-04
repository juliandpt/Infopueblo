import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from 'src/environments/environment';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HostListener } from "@angular/core";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  fieldSearch: string = '';
  townsList: [{id_town: string, name: string}] | [] = []
  text!: string;
  
  active: boolean = false;
  screenHeight!: number;
  screenWidth!: number;

  constructor(public authService: AuthService, private http: HttpClient, public router: Router) {
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    console.log(this.screenWidth, this.screenHeight);

    if (this.screenWidth < 700) {
      console.log('This will always executed.');
      this.active = true;
    }
  }

  ngOnInit(): void {
    this.http.get(`${baseUrl}town/getTowns`).toPromise().then(response => {
      this.townsList = response as [{id_town: string, name: string}]
    })
  }

  filterTowns: OperatorFunction<any, any> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.townsList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map(town => town.name).slice(0, 10))
    )

  getTown() {
    for (var i = 0; i < this.townsList.length; i++){
      if (this.fieldSearch === this.townsList[i].name) {
        var town = this.townsList[i].id_town
        this.router.navigate(['town/', town])
      } 
    }
  }
  
  exit() {
    if (this.authService.loggedIn()) {
      this.text = "Cerrar Sesión";
      this.authService.userLogout();
    } else {
      this.text = "Iniciar Sesión";
      this.router.navigate(['/login']);
    }
  }
}
