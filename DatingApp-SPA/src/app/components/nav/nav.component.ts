import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any  = {};

  constructor(private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit(): void {
  }

  login() {
    console.log(this.model);
    this.authService.login(this.model).subscribe(next => {
      this.alertify.success("Logged in succesfully");
    }, error => {
      this.alertify.error("Error Logging In!")
    })
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
