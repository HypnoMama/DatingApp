import { Injectable } from "@angular/core";
import { Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Message } from '../_models/message';
import { UserService } from '../services/user.service';
import { AlertifyService } from '../services/alertify.service';
import { ActivatedRouteSnapshot } from "@angular/router";
import { Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class MessagesResolver implements Resolve<Message[]> {
    
    pageNumber = 1;
    pageSize = 5;
    messageContainer = "Unread";

    constructor(private userService: UserService, 
        private authService: AuthService,
        private router: Router, 
        private alertify: AlertifyService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Message[]> {
        return this.userService.getMessages(this.authService.decodedToken.nameid, 
                this.pageNumber, this.pageSize, this.messageContainer)
        .pipe(
            catchError(error => {
                this.alertify.error("Problem retrieving messages")
                this.router.navigate(["/home"])
                return of(null); //rxjs way to return null
            })
        )
    }
}