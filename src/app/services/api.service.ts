import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {

  }

  getItemFromLocal(key: any):any {
    if (isPlatformBrowser(this.platformId)) {
      
      let returnVal = localStorage.getItem(key);
      return returnVal;
    }
    return "Failed"; // Return a fallback for SSR
  }

  setItemInLocal(key: any, value: any): string {

    if (isPlatformBrowser(this.platformId)) {
      
      localStorage.setItem(key, value);
      return "Data Saved";
    }
    return "Failed"; // Return a fallback for SSR
  }

  deleteItemFromLocal(deleteId: any) {
    if (isPlatformBrowser(this.platformId)) {
      
      localStorage.removeItem(deleteId);
      return "Data Record for: " + deleteId + " Deleted Successfuly";
    }
    return "Failed"; // Return a fallback for SSR
  }

  deleteAllItemsFromLocal() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      return "Data Cleared";
    }
    return "Failed"; // Return a fallback for SSR
  }

  getAllItemsFromLocal() {
    let allItems: any = [];

    //logic

    return allItems;
  }

  lengthOfDataInLocalStorage():any{
    if (isPlatformBrowser(this.platformId)) {
      let len:any = localStorage.length;
      return len;
    }
    return 0;
  }

}
