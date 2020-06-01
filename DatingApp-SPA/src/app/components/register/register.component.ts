import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  model: any = {};

  @Input()
  registerMode: boolean;

  @Output()
  cancelRegister = new EventEmitter();
  
  showRegister: boolean = false;

  constructor(private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit(): void {
  }

  register() {
    console.log(this.model)
    this.authService.register(this.model).subscribe(res => {
      this.alertify.success("Registration Successful!")
    }, error => this.alertify.error(error)
    )
  }

  cancel() {
    console.log("cancelled")
    console.log(this.registerMode)
    this.cancelRegister.emit(false);
  }

}
