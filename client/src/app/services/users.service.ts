import { HttpClient } from '@angular/common/http';
import { baseUrl } from 'src/environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  getUser() {
    return this.http.get(`${baseUrl}user/getUser`);
  }

  getUsers() {
    return this.http.get(`${baseUrl}user/getUsers`);
  }

  getAdmin() {
    return this.http.get(`${baseUrl}user/getAdmin`);
  }

  getAdmins() {
    return this.http.get(`${baseUrl}user/getAdmins`);  
  }

  getAllUsers() {
    return this.http.get(`${baseUrl}user/getAllUsers`);  
  }

  userEdit(userPayload, id) {
    return this.http.post<any>(`${baseUrl}user/edit/${id}`, userPayload)
  }

  deleteUser(id) {
    return this.http.delete<any>(`${baseUrl}user/delete/${id}`)
  }

  setAdmin(id) {
    return this.http.get<any>(`${baseUrl}user/setAdmin/${id}`)
  }
}
