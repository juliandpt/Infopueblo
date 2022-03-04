import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { baseUrl } from 'src/environments/environment';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  email: any;
  token: any;

  constructor(private route: ActivatedRoute, private http: HttpClient) { 
    this.email = this.route.snapshot.queryParamMap.get('email')
    this.token = this.route.snapshot.queryParamMap.get('token')
  }

  ngOnInit(): void {
    this.http.post(`${baseUrl}user/validate`, { 
      email: this.email,
      token: this.token
    }).toPromise()
  }
}
