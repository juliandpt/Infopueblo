import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-psswd',
  templateUrl: './forgot-psswd.component.html',
  styleUrls: ['./forgot-psswd.component.scss']
})
export class forgotPasswordComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email])
  });

  badreq: boolean = false;
  goodreq: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit() { }

  get email(){
    return this.form.get('email')
  }

  submit() {
    this.authService.forgotPassword(this.form.value)
      .subscribe(
        response => {
          this.badreq = false;
          this.goodreq = true;
        },
        error => {
          this.badreq = true;
        })
  }
}
