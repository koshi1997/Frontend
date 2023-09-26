import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../services/snackbar.service';
import { GlobleConstants } from '../shared/globle-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  hide = true;
  loginform: any = FormGroup;
  responseMessage: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<LoginComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackbarService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.loginform = this.formBuilder.group({
      email: [null, [Validators.required, Validators.pattern(GlobleConstants.emailRegex)]],
      password:[null,[Validators.required]],

    });
  }

  handleSubmit(){
    this.ngxService.start();
    var formData = this.loginform.value;
    var data = {
      email:formData.email,
      password:formData.password,

    }
    this.userService.login(data).subscribe((response:any)=>{
      this.ngxService.stop();
      this.responseMessage = response ?.message;
      this.dialogRef.close();
      localStorage.setItem('token',response.token);
      this.router.navigate(['/cafe/dashboard'])
      this.snackbarService.openSnackBar(this.responseMessage,'Successfully Login');
    },(error)=>{
      this.ngxService.stop();
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      }else{
        this.responseMessage = GlobleConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobleConstants.error);
    })
  }

}

