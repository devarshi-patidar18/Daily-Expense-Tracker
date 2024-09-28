import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {

  constructor(public apiService:ApiService) { }

  /**
   * Iterate cookie and pushing in list
   * @returns list
   */
  transferLocalStorageDataToList(type:any): any {
    if(type=="categories"){
      let tempList: any = [];
      let i: any = 0;
      while (i >= 0) {
        i = i + 1;
        let obj: any = {};
        try {
          obj = JSON.parse(this.apiService.getItemFromLocal(i));
          
          if (obj.name != '' && obj.name !== null && obj.name != undefined) {
            // console.log(obj)
            tempList.push(obj);
          }
        } catch (error) {
          i = -1;
        }
      }
      // console.log(tempList);
      return tempList;
    }
    if(type=="transactions"){
    let tempList: any = [];
    let i: any = 0;
    while (i >= 0) {
      i = i + 1;
      let obj: any = {};
      try {
        obj = JSON.parse(this.apiService.getItemFromLocal(i));
        // console.log(obj)
        if (obj.itemName != '' && obj.itemName !== null && obj.itemName != undefined) {
          // console.log(obj)
          tempList.push(obj);
        }
      } catch (error) {
        i = -1;
      }
    }
    // console.log(tempList);
    return tempList;
    }
  }

  organiseByDate(inputList: any) {
    let returnList: any = [];
    let i = 0;

    inputList.forEach((i1: any) => {
      if (!this.isElementExistInList(i1.date,returnList)) {
        returnList.push(
          {
            date: i1.date,
            transactions: [],
            totalExpenseOfTheDay:0,
            totalIncomeOfTheDay:0
          }
        );
        let tempInt:number = 0;
        let tempInt2:number = 0;
        inputList.forEach((i2: any) => {
         
          if (returnList[i]!=undefined && i2.date == returnList[i].date) {
            if(i2.type=='debit'){
              tempInt = tempInt + i2.itemCost;
            }
            else{
              tempInt2 = tempInt2 + i2.itemCost;
            }
            returnList[i].totalExpenseOfTheDay = tempInt;
            returnList[i].totalIncomeOfTheDay = tempInt2;
            returnList[i].transactions.push(i2);
          }
        });

        // return returnList;
        i++;
      }
      
    });
    
    return this.sortDataByDate(returnList);;
  }

  sortDataByDate(inputList:any) {
    inputList.sort((a:any, b:any) => {
      // Convert the date strings to Date objects for comparison
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return inputList;
  }

  isElementExistInList(item:any,list:any):boolean{
    let returnValue:boolean = false;
    list.forEach((l1:any) => {
      if(l1.date==item){
        returnValue = true;
        return;

      }
    });
    return returnValue;
  }

  /**
   * Total
   */

}
