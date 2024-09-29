import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {

  constructor(public apiService: ApiService) { }

  monthMap: { [key: string]: string } = {
    Jan: 'January',
    Feb: 'February',
    Mar: 'March',
    Apr: 'April',
    May: 'May',
    Jun: 'June',
    Jul: 'July',
    Aug: 'August',
    Sep: 'September',
    Oct: 'October',
    Nov: 'November',
    Dec: 'December',
  };

  convertMonth(abbreviatedMonth: string): string {
    return this.monthMap[abbreviatedMonth] || 'Invalid Month';
  }

  /**
   * Iterate cookie and pushing in list
   * @returns list
   */
  transferLocalStorageDataToList(type: any): any {
    if (type == "categories") {
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
    if (type == "transactions") {
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

  organiseData(inputList: any, organiseBy: any) {
    if (organiseBy == 'date') {
      let returnList: any = [];
      let i = 0;

      inputList.forEach((i1: any) => {
        if (!this.isElementExistInList(i1.date, returnList)) {
          returnList.push(
            {
              date: i1.date,
              transactions: [],
              totalExpenseOfTheDay: 0,
              totalIncomeOfTheDay: 0
            }
          );
          let tempInt: number = 0;
          let tempInt2: number = 0;
          inputList.forEach((i2: any) => {

            if (returnList[i] != undefined && i2.date == returnList[i].date) {
              if (i2.type == 'debit') {
                tempInt = tempInt + i2.itemCost;
              }
              if (i2.type == 'credit') {
                tempInt2 = tempInt2 + i2.itemCost;
              }
              if (i2.type == 'tolend' && i2.itemCategoryId=='Paying Dues') {
                tempInt = tempInt + i2.itemCost;
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

      return this.sortDataBy(returnList, 'date');
    }

    else if (organiseBy == 'itemName') {
      let returnList: any = [];
      let i = 0;
      // console.log(inputList)
      inputList.forEach((i1: any) => {
        if (!this.isElementExistInList(i1.date, returnList)) {
          returnList.push(
            {
              itemName: i1.itemName,
              transactions: [],
              totalBorrowed: 0,
              totalLended: 0
            }
          );
          let tempInt: number = 0;
          let tempInt2: number = 0;
          inputList.forEach((i2: any) => {

            if (returnList[i] != undefined && i2.itemName == returnList[i].itemName) {
              if (i2.type == 'borrow') {
                tempInt = tempInt + i2.itemCost;
              }
              if (i2.type == 'tolend') {
                tempInt2 = tempInt2 + i2.itemCost;
              }
              returnList[i].totalBorrowed = tempInt;
              returnList[i].totalLended = tempInt2;
              returnList[i].transactions.push(i2);
            }
          });

          // return returnList;
          i++;
        }

      });
      console.log(returnList);
      const uniqueNames = new Set<string>();
      const uniquePayments = returnList.filter((t1:any) => {
        if (!uniqueNames.has(t1.itemName) && t1.totalBorrowed-t1.totalLended!=0) {
          uniqueNames.add(t1.itemName);
          return true; // Keep this transaction
        }
        return false; // Filter out duplicates
      });
      return uniquePayments;
    }
  }

  sortDataBy(inputList: any, sortBy: any) {
    if (sortBy == 'date') {
      inputList.sort((a: any, b: any) => {
        // Convert the date strings to Date objects for comparison
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      return inputList;
    }

  }

  isElementExistInList(item: any, list: any): boolean {
    let returnValue: boolean = false;
    list.forEach((l1: any) => {
      if (l1.date == item) {
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
