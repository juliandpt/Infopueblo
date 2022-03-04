import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
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

  constructor(private userService: UsersService, private router: Router, private route: ActivatedRoute) { }

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
    this.userService.userEdit(this.form.value, this.route.snapshot.params.id)
      .subscribe(
        response => {
          this.badreq = false;
          this.goodreq = true;
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000)
        },
        error => {
          this.badreq = true;
        })
  }
}
