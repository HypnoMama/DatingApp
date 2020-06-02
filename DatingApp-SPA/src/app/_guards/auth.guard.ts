import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AlertifyService } from '../services/alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  //could remove the parameters and it can return type boolean, can remove everything else for our needs
  
  /**
   *
   */
  constructor(private authService: AuthService, 
    private router: Router, 
    private alertify: AlertifyService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.authService.loggedIn()) {
        return true;
      }
      this.alertify.error("Thou shalt not pass!!!");
      this.router.navigate(['/home']);
    
  }
  
}
