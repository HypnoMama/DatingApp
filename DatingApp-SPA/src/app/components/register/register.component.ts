import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker/bs-datepicker.config';
import { User } from 'src/app/_models/user';
import { Router } from '@angular/router';


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
  
  user: User;
  showRegister: boolean = false;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;


  constructor(private authService: AuthService, 
      private alertify: AlertifyService, 
      private fb: FormBuilder,
      private router: Router
      ) { }

  ngOnInit(): void {
    this.bsConfig = {
      containerClass: 'theme-red'
    }
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.fb.group({
      //first value is default value
      gender: ['male'], //radio and can validate it
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

    if (this.registerForm.valid) {
      //clone registerForm values to empty object and assign to user
      this.user = Object.assign({}, this.registerForm.value);
    }
    this.authService.register(this.user).subscribe(() => {
      this.alertify.success("Registration Successful!")
    }, error => {
      this.alertify.error(error)
    }, () => {
      this.authService.login(this.user).subscribe(() => {
        this.router.navigate(['/members']);
      });
    });
  }

  cancel() {
    console.log("cancelled")
    console.log(this.registerMode)
    this.cancelRegister.emit(false);
  }

}
