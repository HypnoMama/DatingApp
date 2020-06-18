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
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.fb.group({
      //first value is default value
      gender: ['male'], //radial and can validate it
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
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
