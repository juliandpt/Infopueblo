import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)])
  });

  email: any;
  token: any;

  badreq: boolean = false;
  goodreq: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {
    this.email = this.route.snapshot.queryParamMap.get('email')
    this.token = this.route.snapshot.queryParamMap.get('token')
  }

  ngOnInit(): void { }
   
  get password(){
    return this.form.get('password')
  }
   
  get confirmPassword(){
    return this.form.get('confirmPassword')
  }

  submit() {
    this.authService.changePassword(this.form.value, this.email, this.token)
      .subscribe(
        response => {
          this.badreq = false;
          this.goodreq = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000)
        },
        error => {
          this.badreq = true;
        })
  }
}

