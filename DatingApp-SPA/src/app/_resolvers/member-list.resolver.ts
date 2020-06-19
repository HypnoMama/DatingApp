import { Injectable } from "@angular/core";
import { Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { User } from '../_models/user';
import { UserService } from '../services/user.service';
import { AlertifyService } from '../services/alertify.service';
import {ActivatedRouteSnapshot} from "@angular/router";
import { Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class MemberListResolver implements Resolve<User[]> {
    
    pageNumber = 1;
    pageSize = 5;

    constructor(private userService: UserService, 
        private router: Router, 
        private alertify: AlertifyService) {
       
    }
    resolve(route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot): Observable<User[]> {
        return this.userService.getUsers(this.pageNumber, this.pageSize).pipe(
            catchError(error => {
                this.alertify.error("Problem retrieving data")
                this.router.navigate(["/home"])
                return of(null); //rxjs way to return null
            })
        )
    }
}