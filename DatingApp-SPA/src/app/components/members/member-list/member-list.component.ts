import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/_models/user';
import { Observable } from 'rxjs';
import { AlertifyService } from 'src/app/services/alertify.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  Users : User[];

  constructor(private userService: UserService, private alertify: AlertifyService, 
    private authService: AuthService, private route: ActivatedRoute) {
    
   }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.Users = data['users'];
    })
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(res => {this.Users = res}, error => this.alertify.error(error));
  }

}
