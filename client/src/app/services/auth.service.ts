import { Router, ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { baseUrl } from 'src/environments/environment';
import { analyzeAndValidateNgModules } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

  userRegister(userPayload) {
    return this.http.post<any>(`${baseUrl}user/register`, userPayload)
  }

  userLogin(userPayload) {
    return this.http.post(`${baseUrl}user/login`, userPayload);
  }
  forgotPassword(userPayload) {
    return this.http.post(`${baseUrl}user/forgot-password`, userPayload)
  }
  changePassword(userPayload, email, token) {
   let values = {
      "password" : userPayload.password,
      "email" : email,
      "token" : token
    }
    console.log(this.changePassword)
    return this.http.post(`${baseUrl}user/changePassword`, values)
  }

  loggedIn() {
    return !!localStorage.getItem('token')
  }

  userLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login'])
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
