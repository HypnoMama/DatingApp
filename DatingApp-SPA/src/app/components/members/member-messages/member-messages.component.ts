import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from 'src/app/_models/message';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {


  @Input()
  recipientId: number;

  messages: Message[];
  newMessage: any = {};

  constructor(private authService: AuthService, 
          private userService: UserService, private alertify: AlertifyService) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const currentUserId = +this.authService.decodedToken.nameid; //remember that the + converts to number
    this.userService.getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
    .pipe(
      //tap allows us to do something before we subscribe
      tap(messages => {
        for (let i = 0; i < messages.length; i++) {
          if (messages[i].isRead == false && messages[i].recipientId === currentUserId) {
            this.userService.markAsRead(currentUserId, messages[i].id);
          }
          
        }
      })
    )
      .subscribe(messages => {
        this.messages = messages;
      }, error => {
        this.alertify.error(error);
      })
  }

  sendMessage() {
    console.log(this.newMessage.content)
    this.newMessage.recipientId = this.recipientId;
    this.userService.sendMessage(this.authService.decodedToken.nameid, this.newMessage)
      .subscribe((message: Message) => {
        this.messages.unshift(message);
        this.newMessage.content = '';
      }, error => {
        this.alertify.error(error);
      })
  }
  

}
