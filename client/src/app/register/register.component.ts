import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    surnames: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.required,
      Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)])
  });
  
  goodreq: boolean = false;
  badreq: boolean = false;
  unauth: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void { }

  get name(){
    return this.form.get('name')
  }

  get surnames(){
    return this.form.get('surnames')
  }

  get email(){
    return this.form.get('email')
  }

  get password(){
    return this.form.get('password')
  }

  submit() {
    this.authService.userRegister(this.form.value)
      .subscribe(
        response => {
          this.badreq = false;
          this.unauth = false;
          this.goodreq = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000)
        },
        error => {
          if (error.status == 401) {
            this.badreq = false;
            this.unauth = true;
          } else {
            this.badreq = false;
            this.badreq = true;
          }
        })
  }

}