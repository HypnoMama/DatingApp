import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { User } from 'src/app/_models/user';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/services/alertify.service';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm')
  editForm: NgForm;

  //this brings up alert box to ask user if they are sure if they try to close down the browser tab
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }
  //////////////////////////////////////////////////////////

  user: User

  constructor(private route: ActivatedRoute, 
    private alertify: AlertifyService, 
    private authService: AuthService,
    private userService: UserService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      console.log(data)
      this.user = data['user']
    })
  }

  updateUser() {
    console.log(this.user);
    this.userService.updateUser(this.authService.decodedToken.nameid, this.user)
      .subscribe(next => {
        this.alertify.success("User updated successfully");
        //reset the form to !dirty (pristine) but giving it this.user so that our user information populates
        this.editForm.reset(this.user);

      }, error => {
        this.alertify.error(error);
      });
    }
    

}
