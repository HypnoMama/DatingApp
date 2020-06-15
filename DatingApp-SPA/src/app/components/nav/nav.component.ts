import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any  = {};
  photoUrl: string;

  constructor(public authService: AuthService, private alertify: AlertifyService,
    private router: Router) { }

  ngOnInit(): void {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
  }

  login() {
    console.log(this.model);
    this.authService.login(this.model).subscribe(next => {
      this.alertify.success("Logged in succesfully");
    }, error => {
      this.alertify.error("Error Logging In!")
    }, () => {
      this.router.navigate(['/members']);
    });
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  getPhoto(): string {
    console.log(this.authService.currentUser.photoUrl)
    return this.authService.currentUser.photoUrl;
  }

  logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertify.success('Logged out successfully');
    this.router.navigate(['/home']);
  }

}
