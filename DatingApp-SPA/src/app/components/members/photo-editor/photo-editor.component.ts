import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Photo } from 'src/app/_models/Photo';
import { FileSelectDirective, FileDropDirective, FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';


@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {

  @Input()
  photos: Photo[];

  @Output()
  getMemberPhotoChange = new EventEmitter<string>();

  baseUrl: string = environment.apiUrl;
  
  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;

  currentMain:Photo;
 
  constructor(private userService: UserService, private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit() {
    this.initializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + "users/" + this.authService.decodedToken.nameid + "/photos",
      authToken: "Bearer " + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      //10MB
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        //convert string to object
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        this.photos.push(photo);
      }
    }
  }

  setMainPhoto(photo:Photo) {
    this.userService.setMainPhoto(photo.id, this.authService.decodedToken.nameid)
      .subscribe(next => {
        //change current main to false and set the photo isMain property on selected photo
        //filter returns an array and it will be of one item so set currentmain to found[0]
        this.currentMain = this.photos.filter(p => p.isMain === true)[0];
        this.currentMain.isMain = false;
        photo.isMain = true;
        // this.getMemberPhotoChange.emit(photo.url);
        //Change the authService photoUrl observable to chosen photo -> all components subscribed to this will change (app and nav)
        this.authService.changeMemberPhoto(photo.url);
        //change the currentUser in authService's photo url to the one selected
        this.authService.currentUser.photoUrl = photo.url;
        //persist this change to localStorage
        localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
      }, error => {
        this.alertify.error(error);
      })
  }

  deletePhoto(photoId: number) {
    //confirm with user if they want to delete first
    this.alertify.confirm("Are you sure you want to delete this photo?", () => {
      this.userService.deletePhoto(photoId, this.authService.decodedToken.nameid)
      .subscribe(() => {
        this.photos = this.photos.filter(photo => photo.id != photoId)
        this.alertify.success("Photo has successfully been deleted");
      }, error => {
        this.alertify.error(error);
      })
    })
    
  }

}
