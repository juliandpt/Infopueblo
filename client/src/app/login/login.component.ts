import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email]),
    password: new FormControl('', [
      Validators.required
    ])
  });
  
  unauth: boolean = false;
  badreq: boolean = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  ngOnInit() { }

  get email(){
    return this.form.get('email')
  }

  get password(){
    return this.form.get('password')
  }

  submit() {
    this.authService.userLogin(this.form.value)
      .subscribe(
        response => {
          localStorage.setItem('token', response['token']);
          this.router.navigate(['/']);
        },
        error => {
          if (error.status == 401) {
            this.unauth = true;
          } else {
            this.badreq = true;
          }
        })
  }
}
