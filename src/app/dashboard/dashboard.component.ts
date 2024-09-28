import { Component } from '@angular/core';
import { DataStoreService } from '../services/data-store.service';
import { BrowserModule } from '@angular/platform-browser';
import { ChartModule } from 'primeng/chart';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

type Transaction = {
    name: string;
    cost: number;
};

type MonthlyTransactions = {
    month: string;
    transactions: Transaction[];
};

type ItemTotals = {
    [key: string]: number;
};

type MonthlyTotal = {
    month: string;
    totals: ItemTotals;
};

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [ChartModule, FormsModule],
    templateUrl: './dashboard.component.html',
    providers: [DatePipe],
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

    transactionsList: any = [];
    categoriesList: any = [];
    monthsList: any = [];
    categoryChartData: any;
    categoryChartOptions: any;
    monthChartData: any;
    monthChartOptions: any;
    isBarChart: boolean = false;
    isApplyFilter: boolean = false;
    filterModule: any = {};
    isChartOpen: boolean = false;
    isLoadingSearchResult: boolean = false;
    searchedResults: any = [];
    isChartOptions: boolean = false;
    isMonthlyChart: boolean = false;
    chartButton: string = "";
    selectedMonth: any;
    isShowStatistics:boolean = false;
    constructor(public dataStore: DataStoreService, public cookie: CookieService, public datePipe: DatePipe, public apiService: ApiService) { }

    ngOnInit() {
        this.transactionsList = this.dataStore.transferLocalStorageDataToList("transactions");
        this.categoriesList = this.dataStore.transferLocalStorageDataToList("categories");
        // this.categoryChartDetails('Sep');
        this.monthChartDetails(this.getMonthsFromLocalStorage());
        this.monthsList = this.getMonthsFromLocalStorage();
        // this.getCategoryDataFromLocalStorage()
        
    }

    /**Get Monthly Data from Local Storage */
    getMonthsFromLocalStorage() {
        let tempMonthList: any = [];
        let returnListValue: any = [];
        this.dataStore.transferLocalStorageDataToList("transactions").forEach((element: any) => {
            tempMonthList.push(this.datePipe.transform(element.date, "MMM"));
        });
        let tempList = Array.from(new Set(tempMonthList));

        tempList.forEach((e1: any) => {
            let totalExpenseOfTheMonth: number = 0;
            let totalIncomeOfTheMonth: number = 0;
            this.dataStore.organiseByDate(this.dataStore.transferLocalStorageDataToList("transactions")).forEach((e2: any) => {
                if (e1 == (this.datePipe.transform(e2.date, "MMM"))) {
                    totalExpenseOfTheMonth = totalExpenseOfTheMonth + e2?.totalExpenseOfTheDay;
                    totalIncomeOfTheMonth = totalIncomeOfTheMonth + e2?.totalIncomeOfTheDay;
                }
            });
            returnListValue.push(
                {
                    monthName: e1,
                    totalExpenseOfTheMonth: totalExpenseOfTheMonth,
                    totalIncomeOfTheMonth: totalIncomeOfTheMonth
                }
            )
        });


        return returnListValue;
    }


    /** Get monthly Category wise Expense and Income from local storage */
    getCategoryDataFromLocalStorage(chartTpe:any) {
        const monthlyTotals: { [key: string]: ItemTotals } = {};

        this.dataStore.organiseByDate(this.dataStore.transferLocalStorageDataToList("transactions")).forEach((entry: any) => {
            const monthName: any = this.datePipe.transform(entry.date, "MMM");

            if (!monthlyTotals[monthName]) {
                monthlyTotals[monthName] = {};
            }

            console.log(entry)
            entry.transactions.forEach((transaction: any) => {
                if(chartTpe=='category'){
                    if (!monthlyTotals[monthName][transaction.itemCategoryId] && transaction.type=='debit') {
                        monthlyTotals[monthName][transaction.itemCategoryId] = 0;
                    }
                    monthlyTotals[monthName][transaction.itemCategoryId] += transaction.itemCost;
                }
                if(chartTpe=='item'){
                    if (!monthlyTotals[monthName][transaction.itemName] && transaction.type=='debit') {
                        monthlyTotals[monthName][transaction.itemName] = 0;
                    }
                    monthlyTotals[monthName][transaction.itemName] += transaction.itemCost;
                }
            });
        });

        const organizedArray: MonthlyTotal[] = Object.entries(monthlyTotals).map(([month, totals]) => ({
            month,
            totals: Object.entries(totals)
                .sort(([, a], [, b]) => b - a) // Sort by value (cost) in descending order
                .reduce((acc, [name, cost]) => {
                    acc[name] = cost;
                    return acc;
                }, {} as ItemTotals)
        }));

        return organizedArray;
    }


    /** Monthly Chart List data process method */
    monthChartDetails(inputDataList: any) {
        let labelsList: any = [];
        let incomeData: any = [];
        let expenseData: any = [];
        inputDataList.forEach((e1: any) => {
            labelsList.push(e1.monthName);
            incomeData.push(e1.totalIncomeOfTheMonth)
            expenseData.push(e1.totalExpenseOfTheMonth)
        });

        // Monthly Chart details starts
        this.monthChartData = {
            labels: labelsList,
            datasets: [
                {
                    label: 'Total Income of the month',
                    data: incomeData
                },
                {
                    label: 'Total Expense of the month',
                    data: expenseData
                }
            ]
        };
        this.monthChartOptions = {
            indexAxis: 'x',
            maintainAspectRatio: false,
            aspectRatio: .6,

        };
    }

    /** Category Chart List data process method */
    categoryChartDetails(selectedMonth: any,chartType:any) {
        let catLabels: any = [];
        let catData:any = [];
        this.getCategoryDataFromLocalStorage(chartType).forEach((data: any) => {
            if (data.month == selectedMonth) {
                    catLabels = Object.keys(data.totals);
                    catData = Object.values(data.totals);
            }
        })


        // categoriesList.forEach((element: any) => {
        //     catLabels.push(element.name);
        // });
        console.log(catLabels);
        console.log(catData)
        // Category Chart Details Starts
        this.categoryChartData = {
            labels: catLabels,
            datasets: [
                {
                    label: 'Expense on the Category in '+ selectedMonth,
                    data: catData
                }
            ]
        };

        this.categoryChartOptions = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: .6,
        };
    }

    chartsAccordion(value: any) {
        this.isApplyFilter = false;
        if (value == "") {

            this.isChartOptions = !this.isChartOptions;
        }
        if (value == "monthChart") {
            this.isChartOpen = true;
            this.chartButton = "monthChart";
        }
        if (value == "categoriesChart") {
            this.isChartOpen = true;
            this.chartButton = "categoriesChart";
        }
        if (value == "itemsChart") {
            this.isChartOpen = true;
            this.chartButton = "itemsChart";
        }

    }

    globalSearchButtonClicked() {
        this.isChartOptions = false;
        this.isApplyFilter = !this.isApplyFilter;
    }

    searchFilter(event: any) {
        this.isLoadingSearchResult = true;
        setTimeout(() => {
            this.isLoadingSearchResult = false;
        }, 2000);
        let transactionsList: any = [];
        transactionsList = this.dataStore.transferLocalStorageDataToList("transactions");
        let filteredList: any =
            (transactionsList.filter((data: any) => {
                if ((event.target.value).toLowerCase() != '' && ((data.itemName).toLowerCase().indexOf((event.target.value).toLowerCase()) != -1
                    || (data.itemCategoryId).toLowerCase().indexOf((event.target.value).toLowerCase()) != -1)
                ) {
                    return data;
                }
            }))
        this.searchedResults = this.dataStore.organiseByDate(filteredList);
    }

    showStatistics(){
        this.isShowStatistics = !this.isShowStatistics;
    }

}
