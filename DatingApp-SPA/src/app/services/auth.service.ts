import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from "rxjs/operators";
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl: string = environment.apiUrl + "auth/";
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  photoUrl = new BehaviorSubject<string>("../../assets/original.png");
  currentPhotoUrl = this.photoUrl.asObservable();


  constructor(private http: HttpClient) { }

  changeMemberPhoto(photoUrl:string) {
    this.photoUrl.next(photoUrl);
  }

  //send user login information to server, retrieves a token and sets it in localstorage
  login(model) {
    return this.http.post(this.baseUrl + "login", model)
      .pipe(
        map((response: any) => {
          const user = response;
          if (user) {
            localStorage.setItem("token", user.token);
            this.decodedToken = this.jwtHelper.decodeToken(user.token);
            localStorage.setItem("user", JSON.stringify(user.user));
            this.currentUser = user.user;
            this.changeMemberPhoto(this.currentUser.photoUrl);
          }
        })
      );
  }

  getProfilePhoto() {
    if (this.currentUser) {
      return this.currentUser.photoUrl;
    }
  }

  //send user information to register, will retrieve a token, set it which should log in the user
  register(user: User) {
    console.log("in register:" + user.userName)
    return this.http.post(this.baseUrl + "register", user); 
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

}
