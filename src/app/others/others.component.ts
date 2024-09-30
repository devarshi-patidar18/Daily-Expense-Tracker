import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DataStoreService } from '../services/data-store.service';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { DatePipe } from '@angular/common';
import { __values } from 'tslib';

@Component({
  selector: 'app-others',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './others.component.html',
  providers:[DatePipe],
  styleUrl: './others.component.css'
})
export class OthersComponent {

  isAddCat: boolean = false;
  categoryModel: any = {};
  categoryList: any = [];
  isExpectedExpense: boolean = false;
  expectedExpense:number = 0;
  expectedExpenseMonthsList:any = []
  constructor(public cookie: CookieService, public dataStore: DataStoreService, public apiService: ApiService,public datePipe:DatePipe) { }

  ngOnInit() {
    this.categoryList = this.dataStore.transferLocalStorageDataToList("categories");
    this.expectedExpenseMonthsList = this.getExpectedExpenseList();
  }

  clearCookie() {
    if (confirm("Do you realy want to delete all data from the cookie?")) {
      this.apiService.deleteAllItemsFromLocal();
    }
  }

  addCategory(saveDataObj: any) {

    // Edit Transaction
    if (saveDataObj.catId != null) {
      let obj: any = {};
      obj.catId = this.categoryModel.catId;
      obj.name = saveDataObj.name;

      this.apiService.setItemInLocal(saveDataObj.catId, JSON.stringify(obj));

      // Empty the list to avoid duplicate data
      this.categoryList = [];
      this.categoryModel = {};
      this.categoryList = this.dataStore.transferLocalStorageDataToList("categories");

    }
    // New Transaction save
    else if (saveDataObj != undefined && saveDataObj.name != '' && saveDataObj.name != null) {
      let latestIdAvailable: any = this.apiService.lengthOfDataInLocalStorage() + 1;
      let obj: any = {};
      obj.catId = latestIdAvailable;
      obj.name = saveDataObj.name;

      this.apiService.setItemInLocal(latestIdAvailable, JSON.stringify(obj));

      this.categoryList = this.dataStore.transferLocalStorageDataToList("categories");

      this.categoryModel = {};

    }


  }

  editCategory(category: any) {
    alert("As the category Id is not handled in transaction list so temporarily Edit feature is disabled! ")
    // this.categoryModel = category;
  }

  addExpectedExpense(expectedExpense:any){
    // let monthName:any= this.datePipe.transform(new Date(),"ddMMYYYY");
    // this.apiService.setItemInLocal(monthName,expectedExpense);
    // this.expectedExpenseMonthsList = this.getExpectedExpenseList();
  }

  getExpectedExpenseList(){
    let tempList:any =[];

    // tempList = Array.from(this.dataStore.monthMap[__values])
    // tempList.push({
    //   month:this.datePipe.transform(new Date(),"dd-MMMM-YYYY"),
    //   expectedExpense:this.apiService.getItemFromLocal(this.datePipe.transform(new Date(),"ddMMYYYY"))
    // });
    return tempList;
  }

}
