import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from 'src/app/_models/message';
import { Pagination, PaginatedResult } from 'src/app/_models/Pagination';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  messages: Message[];
  pagination: Pagination;
  messageContainer = "Unread";

  constructor(private route: ActivatedRoute, private userService: UserService,
              private alertify: AlertifyService, private authService: AuthService) { }

  ngOnInit(): void {
    
    this.route.data.subscribe(data => {
      console.log(data)
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    })
  }

  loadMessages() {
    this.userService.getMessages(this.authService.decodedToken.nameid, 
            this.pagination.currentPage, this.pagination.itemsPerPage, this.messageContainer)
        .subscribe((res: PaginatedResult<Message[]>) => {
          this.messages = res.result;
          this.pagination = res.pagination;
        }, error => this.alertify.error(error));
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

  deleteMessage(id: number) {
    this.alertify.confirm("Are you sure you want to delete this message?", () => {
      this.userService.deleteMessage(id, this.authService.decodedToken.nameid)
      .subscribe(res => {
        this.messages = this.messages.filter(message => message.id != id);
      }, error => {
        this.alertify.error(error);
      })
    })
    
  }

}
