import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TownsService {

  constructor(private http: HttpClient) { }

  likeTown(id_town) {
    return this.http.post(`${baseUrl}town/like/${id_town}`, { 
      id_town: id_town
    })
  }

  dislikeTown(id_town) {
    return this.http.post(`${baseUrl}town/dislike/${id_town}`, { 
      id_town: id_town
    })
  }

  getTown(id_town) {
    return this.http.get<any>(`${baseUrl}town/getTown/${id_town}`);
  }

  getTowns() {
    return this.http.get(`${baseUrl}town/getTowns`);
  }

  getTopTowns() {
    return this.http.get(`${baseUrl}town/getTopTowns`);
  }

  getLikedTowns() {
    return this.http.get(`${baseUrl}town/getLikedTowns`);
  }

  getTopWeekTowns() {
    return this.http.get(`${baseUrl}town/getTopWeekTowns`);
  }

  getSearchedTowns() {
    return  this.http.get(`${baseUrl}town/getSearchedTowns`);
  }

  getTopLimitedTowns() {
    return this.http.get(`${baseUrl}town/getTopLimitedTowns`);
  }

  getUserLikedTowns() {
    return this.http.get(`${baseUrl}town/getUserLikedTowns`);
  }
  getUserSearchedTowns() {
    return this.http.get(`${baseUrl}town/getUserSearchedTowns`);
  }

  getUserMostSearchedTowns() {
    return this.http.get(`${baseUrl}town/getUserMostSearchedTowns`);
  }
  getUserMostRecentTowns() {
    return this.http.get(`${baseUrl}town/getUserMostRecentTowns`);
  }

  getUserLikedTown(id) {
    return this.http.get(`${baseUrl}town/getUserLikedTown/${id}`);  
  }
  getDailyChallenge() {
    return this.http.get(`${baseUrl}town/getDailyChallenge`);
  }
  getTotalSearchedTowns() {
    return this.http.get(`${baseUrl}town/getTotalSearchedTowns`);
  }
  getTotalSearches() {
    return this.http.get(`${baseUrl}town/getTotalSearches`);
  }
}
