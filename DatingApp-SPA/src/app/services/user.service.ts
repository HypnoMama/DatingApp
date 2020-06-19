import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/Pagination';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = environment.apiUrl;

constructor(private http: HttpClient) { }

getUsers(page?, itemsPerPage?, userParams?) : Observable<PaginatedResult<User[]>> {
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

}
