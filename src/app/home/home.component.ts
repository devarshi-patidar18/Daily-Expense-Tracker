import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataStoreService } from '../services/data-store.service';
import { ApiService } from '../services/api.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './home.component.html',
  providers: [DatePipe],
  styleUrl: './home.component.css'
})
export class HomeComponent {

  transactionModule: any = {};
  expenseOfTheDay: number = 0;
  transactionDataList: any = [];
  filteredList: any = [];
  isEditClicked: boolean = false;
  categoryList: any = [];
  isAddButtonDisabled: boolean = true;
  openAddTransactionForm: boolean = false;

  constructor(public dataStore: DataStoreService, public datePipe: DatePipe, public apiService: ApiService) { }

  ngOnInit() {

    this.transactionModule.type = "debit";
    this.transactionModule.date = this.datePipe.transform(new Date(), "yyyy-MM-dd");
    this.transactionModule.selectedCategory = 'Select Item Category';

    this.transactionDataList = this.dataStore.transferLocalStorageDataToList("transactions");

    // Date filtered list
    this.filteredList = this.dataStore.organiseData(this.transactionDataList, 'date');

    // Item Categories
    this.categoryList = this.dataStore.transferLocalStorageDataToList("categories");
    // console.log(this.categoryList);
    console.log(this.filteredList);

    // this.transactionModule.selectedCategory = 'Gulab Mukati Milk';

  }

  selectCategory(event: any) {
    this.transactionModule.selectedCategory = event.target.value;
    // console.log(event.target);
  }

  addTransaction(saveDataObj: any) {
    // Edit Transaction
    if (saveDataObj.id != null) {
      // console.log(saveDataObj)
      // let latestIdAvailable = this.transactionDataList.length + 1;
      let obj: any = {};
      obj.id = this.transactionModule.id;
      obj.date = saveDataObj.date;
      obj.itemName = saveDataObj.itemName;
      obj.itemCategoryId = saveDataObj.selectedCategory;
      obj.itemCost = saveDataObj.itemCost;
      obj.type = saveDataObj.type;

      this.apiService.setItemInLocal(this.transactionModule.id, JSON.stringify(obj));

      // Empty the list to avoid duplicate data
      this.transactionDataList = [];
      this.filteredList = [];
      this.transactionModule = {};
      // check wheather latestavailable id's data is inserted or not | and transfer data from cookie to list
      this.transactionModule.type = "debit";
      this.transactionModule.date = this.datePipe.transform(new Date(), "YYYY-MM-dd");
      this.transactionDataList = this.dataStore.transferLocalStorageDataToList("transactions");
      this.filteredList = this.dataStore.organiseData(this.transactionDataList, 'date');

      this.isEditClicked = false;
      this.isAddButtonDisabled = true;
    }

    // New Transaction save
    else if (saveDataObj.itemName != '' && saveDataObj.itemName != null && saveDataObj.itemName != undefined
      && saveDataObj.date != null && saveDataObj.date != '' && saveDataObj != undefined) {
      let latestIdAvailable = this.apiService.lengthOfDataInLocalStorage() + 1;
      let obj: any = {};
      obj.id = latestIdAvailable;
      obj.date = saveDataObj.date;
      obj.itemName = saveDataObj.itemName;
      obj.itemCategoryId = saveDataObj.selectedCategory;
      obj.itemCost = saveDataObj.itemCost;
      obj.type = saveDataObj.type;

      // this.cookie.set(latestIdAvailable, JSON.stringify(obj));
      this.apiService.setItemInLocal(latestIdAvailable, JSON.stringify(obj));

      // Empty the list to avoid duplicate data
      this.transactionDataList = [];
      this.filteredList = [];

      // check wheather latestavailable id's data is inserted or not | and transfer data from storage to list
      // if (this.cookie.check(latestIdAvailable)) {
      this.transactionDataList = this.dataStore.transferLocalStorageDataToList("transactions");
      this.filteredList = this.dataStore.organiseData(this.transactionDataList, 'date');
      console.log()
      // }
      // console.log(this.filteredList)
      this.isAddButtonDisabled = true;
      this.transactionModule = {};
      this.transactionModule.type = "debit";
      this.transactionModule.date = this.datePipe.transform(new Date(), "YYYY-MM-dd");
    }
  }

  // Delete by transaction id
  deleteTransaction(deleteId: any) {

    // if (confirm("Do you want to delete this data?")) {
    // this.transactionDataList = [];
    // this.apiService.deleteItemFromLocal(deleteId);

    //   this.transactionDataList = this.dataStore.transferLocalStorageDataToList();
    //   this.filteredList = this.dataStore.organiseData(this.transactionDataList);

    // };
    // alert("Delete Feature is not yet implemented!")
  }

  editTransaction(editData: any) {
    console.log(editData);
    window.scroll(0, 0);
    this.isEditClicked = true;
    this.transactionModule = editData;
    this.transactionModule.selectedCategory = editData.itemCategoryId;

  }

  cancelEdit() {
    this.isAddButtonDisabled = true;
    this.isEditClicked = false;
    this.transactionModule = {}
    this.transactionModule.type = "debit";
    this.transactionModule.date = this.datePipe.transform(new Date(), "YYYY-MM-dd");
    this.transactionDataList = this.dataStore.transferLocalStorageDataToList("transactions");
    this.filteredList = this.dataStore.organiseData(this.transactionDataList, 'date');
  }

  desableAddButton() {
    console.log(this.transactionModule.selectedCategory != 'Select Item Category');
    if (this.transactionModule.itemName != '' && this.transactionModule.itemName !== null && this.transactionModule.itemName != undefined
      && this.transactionModule.itemCost != '' && this.transactionModule.itemCost !== null && this.transactionModule.itemCost != undefined
      && this.transactionModule.selectedCategory != 'Select Item Category'
    ) {
      this.isAddButtonDisabled = false;
    }
    else {
      this.isAddButtonDisabled = true;
    }

  }

  setCategoryList(transactionType: any) {
    if ((transactionType == "tolend")) {
      
      let tempList:any = [
        { catId: 1, name: "Paying Back" },
        { catId: 2, name: "Paying Dues" },
        { catId: 3, name: "To Lend" }
      ]
      this.categoryList = tempList;
    }

   else if (transactionType == "borrow") {
      this.categoryList.push({
        catId: 1,
        name: "Cash"
      });
    }


    else {
      this.categoryList = this.dataStore.transferLocalStorageDataToList("categories");
    }
  }

}
