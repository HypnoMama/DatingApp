import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  

  @Input()
  registerMode: boolean;

  @Output()
  cancelRegister = new EventEmitter();
  
  model: any = {};
  showRegister: boolean = false;
  registerForm: FormGroup;


  constructor(private authService: AuthService, private alertify: AlertifyService, private fb: FormBuilder) { }

  ngOnInit(): void {
    // this.registerForm = new FormGroup({
    //   username: new FormControl("", Validators.required),
    //   password: new FormControl("", [Validators.required, Validators.minLength(4), Validators.maxLength(8)]),
    //   confirmPassword: new FormControl("", [Validators.required])

    // }, this.passwordMatchValidator)
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ["", [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ["", [Validators.required]]
    }, {validator: this.passwordMatchValidator});
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : {'mismatch': true}
  }

  register() {
    // console.log(this.model)
    // this.authService.register(this.model).subscribe(res => {
    //   this.alertify.success("Registration Successful!")
    // }, error => this.alertify.error(error)
    // )
    console.log(this.registerForm.value)
  }

  cancel() {
    console.log("cancelled")
    console.log(this.registerMode)
    this.cancelRegister.emit(false);
  }

}
