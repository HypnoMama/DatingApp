import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/Pagination';
import { map } from 'rxjs/operators';
import { isObject } from 'util';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = environment.apiUrl;

constructor(private http: HttpClient) { }

  getUsers(page?, itemsPerPage?, userParams?, likesParam?) : Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();

    let params = new HttpParams();

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    if (userParams != null) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }

    if (likesParam === "Likers") {
      params = params.append('likers', "true");
    }

    if (likesParam === "Likees") {
      params = params.append('likees', "true");
    }

    //observing the response gives us the full http response including headers, otherwise we'd only be observing 
    //body
    return this.http.get<User[]>(this.baseUrl + "users", {observe: 'response', params})
      .pipe(
        //this response variable needs to match the observe value above -> cannot just use res
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
          }
          return paginatedResult;
      })
      );
  }

  getUser(id: number) : Observable<User> {
    return this.http.get<User>(this.baseUrl + "users/" + id);
  }

  updateUser(id:number, user:User) {
    return this.http.put(this.baseUrl + "users/" + id, user);
  }

  setMainPhoto(photoId:number, userId:number) {
    return this.http.post(this.baseUrl + `users/${userId}/photos/${photoId}/setMain`, null);
  }

  deletePhoto(photoId:number, userId: number) {
    return this.http.delete(this.baseUrl + `users/${userId}/photos/${photoId}`);
  }

  sendLike(id: number, recipientId: number) {
    return this.http.post(this.baseUrl + `users/${id}/like/${recipientId}`, {});
  }

  getMessages(id: number, page?, itemsPerPage?, messageContainer?) {
    const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();
    let params = new HttpParams();

    params = params.append('messageContainer', messageContainer)

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    return this.http.get<Message[]>(this.baseUrl + `users/${id}/messages`, {observe: 'response', params})
    .pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') != null) {
          
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
  }

  getMessageThread(id: number, recipientId: number) {
    return this.http.get<Message[]>(this.baseUrl + `users/${id}/messages/thread/${recipientId}`)
  }

  sendMessage(id: number, message: Message) {
    return this.http.post<Message>(this.baseUrl + `users/${id}/messages`, message);
  }

  deleteMessage(id: number, userId: number) {
    return this.http.post(this.baseUrl + `users/${userId}/messages/${id}`, {});
  }

  markAsRead(userId: number, messageId: number) {
    this.http.post(this.baseUrl + `users/${userId}/messages/${messageId}/read`, messageId)
      .subscribe(); //subscribing here as we are not returning anything
  }

}
