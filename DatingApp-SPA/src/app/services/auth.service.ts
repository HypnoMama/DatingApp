import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl: string = "http://localhost:5000/api/auth/";

  constructor(private http: HttpClient) { }

  //send user login information to server, retrieves a token and sets it in localstorage
  login(model) {
    return this.http.post(this.baseUrl + "login", model)
      .pipe(
        map((response: any) => {
          const user = response;
          if (user) {
            localStorage.setItem("token", user.token)
          }
        })
      );
  }

  //send user information to register, will retrieve a token, set it which should log in the user
  register(model) {
    console.log("in register:" + model.username)
    return this.http.post(this.baseUrl + "register", model);
      
      
          
        
      
      
  }


}
