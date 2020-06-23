import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/_models/user';
import { Observable } from 'rxjs';
import { AlertifyService } from 'src/app/services/alertify.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Pagination, PaginatedResult } from 'src/app/_models/Pagination';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  Users : User[];
  user: User = JSON.parse(localStorage.getItem('user'));
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];
  userParams: any = {};
  pagination: Pagination;
  page: number;

  constructor(private userService: UserService, private alertify: AlertifyService, 
    private authService: AuthService, private route: ActivatedRoute) {
    
   }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      console.log(data)
      this.Users = data['users'].result;
      this.pagination = data['users'].pagination;
    });

    this.userParams.gender = this.user.gender === 'female' ? 'male' : 'female';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }

  resetFilters() {
    this.userParams.gender = this.user.gender === 'female' ? 'male' : 'female';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams)
        .subscribe((res: PaginatedResult<User[]>) => {
          this.Users = res.result;
          this.pagination = res.pagination;
        }, 
        error => 
          this.alertify.error(error)
        );
  }

}
