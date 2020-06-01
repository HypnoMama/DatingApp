import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any  = {};

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  login() {
    console.log(this.model);
    this.authService.login(this.model).subscribe(res => {console.log(res)}, error => console.log(error))
  }

  loggedIn() {
    const token = localStorage.getItem("token");
    return !!token;
  }

  logOut() {
    localStorage.removeItem("token");
    console.log("logout")
  }

}
