import { Injectable } from "@angular/core";
import { Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { User } from '../_models/user';
import { UserService } from '../services/user.service';
import { AlertifyService } from '../services/alertify.service';
import {ActivatedRouteSnapshot} from "@angular/router";
import { Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class MemberEditResolver implements Resolve<User> {
    /**
     *
     */
    constructor(private userService: UserService, 
        private authService: AuthService,
        private router: Router, 
        private alertify: AlertifyService) {
       
    }
    resolve(route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot): Observable<User>  {
            
        return this.userService.getUser(this.authService.decodedToken.nameid).pipe(
            catchError(error => {
                this.alertify.error("Problem retrieving your data")
                this.router.navigate(["/members"])
                return of(null); //rxjs way to return null
            })
        )
    }
}