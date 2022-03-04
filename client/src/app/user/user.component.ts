import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TownsService } from '../services/towns.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user: any
  likedTowns: any
  searchedTowns: any
  mostSearchedTown: any
  mostRecentTowns: any
  dailyChallenge: any
  resultado: any
  totalTowns: any
  totalTownsRaw: any
  totalTownsUserRaw: any
  totalTownsUser: any
  
  liked: boolean = false
  loading: boolean = true
  loadingLikedTowns: boolean = true
  loadingSearchedTowns: boolean = true

  constructor(private userService: UsersService, private townService: TownsService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getUser()
      .subscribe(
        response => {
          this.user = response;
        },
        error => {
          this.router.navigate(['/login'])
        })

    this.townService.getUserLikedTowns()
      .subscribe(
        response => {

          this.likedTowns = response;
          this.loading = false
          this.loadingLikedTowns = false
        })
    this.townService.getUserSearchedTowns()
      .subscribe(
        response => {
        
          this.searchedTowns = response;
          this.loading = false
          this.loadingSearchedTowns = false
        })
    this.townService.getUserMostSearchedTowns()
    .subscribe(
      response => {

        this.mostSearchedTown = response;
        this.loading = false
      })
    this.townService.getUserMostRecentTowns()
    .subscribe(
    response => {

      this.mostRecentTowns = response;
      this.loading = false
    })
    this.townService.getDailyChallenge()
    .subscribe(
    response => {
      this.dailyChallenge = response[0].total
      if(this.dailyChallenge > 10) {
        this.resultado = 100
      }
      else this.resultado = this.dailyChallenge * 10

      this.loading = false
    })

    this.townService.getTotalSearchedTowns()
    .subscribe(
    response => {
      this.totalTownsUser = (response[0].total*100)/8134
      this.totalTownsUserRaw = response[0].total
      console.log(this.totalTownsUser)

      this.loading = false
    })

    this.townService.getTotalSearches()
    .subscribe(
    response => {
      this.totalTowns = (response[0].total*100)/8134
      this.totalTownsRaw = response[0].total

      console.log(this.totalTowns)

      this.loading = false
    })
  }

  like(): void {
    this.townService.likeTown(this.likedTowns.id_town)
      .subscribe(
        response => {
          this.liked = true
        },
        error => {
          if (error.status == 500) {
            console.log(error.status)
          } else {
            this.router.navigate(['login'])
          }
        });
  }

  dislike(): void {
    this.townService.dislikeTown(this.likedTowns.id_town)
      .subscribe(
        response => {
          this.liked = false
        });
  }

}

