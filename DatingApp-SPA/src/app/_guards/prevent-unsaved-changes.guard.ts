import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { MemberEditComponent } from '../components/members/member-edit/member-edit.component';

@Injectable({
  providedIn: 'root'
})
export class PreventUnsavedChangesGuard implements CanDeactivate<MemberEditComponent> {
  //this brings up an alert if a user has made changes in their edit profile 
  //asking if they are sure they want to leave without saving


  canDeactivate(
    component: MemberEditComponent) : boolean {
      if (component.editForm.dirty) {
        return confirm("Are you sure you want to continue?  Any unsaved changes will be lost!");
      }
      return true;
  }
  
}
