import { Component } from '@angular/core';
import { DataStoreService } from '../services/data-store.service';
import { BrowserModule } from '@angular/platform-browser';
import { ChartModule } from 'primeng/chart';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, DatePipe } from '@angular/common';
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
    imports: [ChartModule, FormsModule, CommonModule],
    templateUrl: './dashboard.component.html',
    providers: [DatePipe],
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

    transactionsList: any = [];
    categoriesList: any = [];
    monthsList: any = [];
    categoryAndItemChartData: any;
    categoryOrItemChartOptions: any;
    monthChartData: any;
    monthChartOptions: any;
    isBarChart: boolean = false;
    showGlobalFilter: boolean = false;
    filterModule: any = {};
    isChartOpen: boolean = false;
    isLoadingSearchResult: boolean = false;
    searchedResults: any = [];
    isChartOptions: boolean = false;
    isMonthlyChart: boolean = false;
    chartButton: string = "";
    selectedMonth: any;
    isShowStatistics: boolean = false;
    payments: any = [];
    showPaymentsGrid: boolean = false;
    totalPaid: number = 0;
    totalUnpaid: number = 0;
    thisMonthName:any="";
    constructor(public dataStore: DataStoreService, public cookie: CookieService, public datePipe: DatePipe, public apiService: ApiService) { }

    ngOnInit() {
        this.thisMonthName = this.datePipe.transform(new Date(),"MMMM");
        this.transactionsList = this.dataStore.transferLocalStorageDataToList("transactions");
        this.categoriesList = this.dataStore.transferLocalStorageDataToList("categories");
        // this.categoryChartDetails('Sep');
        this.monthChartDetails(this.getMonthDataFromLocalStorage());
        this.monthsList = this.getMonthDataFromLocalStorage();
        // console.log(this.dataStore.convertMonth(this.monthsList[0].monthName));
        this.updateProgress(this.datePipe.transform(new Date(), "ddMMyyyy"), this.monthsList[0] != null && this.monthsList[0] != undefined ? this.monthsList[0].totalExpenseOfTheMonth : 0);
    }

    /**Get Monthly Data from Local Storage */
    getMonthDataFromLocalStorage() {
        let tempMonthList: any = [];
        let returnListValue: any = [];
        this.dataStore.transferLocalStorageDataToList("transactions").forEach((element: any) => {
            tempMonthList.push(this.datePipe.transform(element.date, "MMM"));
        });
        let tempList = Array.from(new Set(tempMonthList));

        tempList.forEach((e1: any) => {
            let totalExpenseOfTheMonth: number = 0;
            let totalIncomeOfTheMonth: number = 0;
            this.dataStore.organiseData(this.dataStore.transferLocalStorageDataToList("transactions"), 'date').forEach((e2: any) => {
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
    organiseTransactionByCatAndItem(chartType: any) {
        const monthlyTotals: { [key: string]: ItemTotals } = {};

        this.dataStore.organiseData(this.dataStore.transferLocalStorageDataToList("transactions"), 'date').forEach((entry: any) => {
            const monthName: any = this.datePipe.transform(entry.date, "MMM");

            if (!monthlyTotals[monthName]) {
                monthlyTotals[monthName] = {};
            }
            entry.transactions.forEach((transaction: any) => {
                if (chartType == 'category' && transaction.type == 'debit') {
                    if (!monthlyTotals[monthName][transaction.itemCategoryId]) {
                        monthlyTotals[monthName][transaction.itemCategoryId] = 0;
                    }
                    monthlyTotals[monthName][transaction.itemCategoryId] += transaction.itemCost;
                }
                if (chartType == 'item' && transaction.type == 'debit') {
                    if (!monthlyTotals[monthName][transaction.itemName]) {
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
    categoryChartDetails(selectedMonth: any, chartType: any) {
        let catLabels: any = [];
        let catData: any = [];
        this.organiseTransactionByCatAndItem(chartType).forEach((data: any) => {
            if (data.month == selectedMonth) {
                let tempTotals: any = data.totals;
                for (const key in tempTotals) {
                    // Check if the value is NaN
                    if (typeof tempTotals[key] === 'number' && isNaN(tempTotals[key] as number)) {
                        delete tempTotals[key]; // Remove the key if the value is NaN
                    }
                }
                catLabels = Object.keys(tempTotals);
                catData = Object.values(tempTotals);
            }
        })

        // Category Chart Details Starts
        this.categoryAndItemChartData = {
            labels: catLabels,
            datasets: [
                {
                    label: 'Expense on the Category in ' + selectedMonth,
                    data: catData
                }
            ]
        };

        this.categoryOrItemChartOptions = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: .6,
        };
    }

    chartsAccordion(value: any) {
        this.showGlobalFilter = false;
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
        this.showGlobalFilter = !this.showGlobalFilter;
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
        this.searchedResults = this.dataStore.organiseData(filteredList, 'date');
    }

    showStatics() {
        this.isShowStatistics = !this.isShowStatistics;
    }

    getPaymentDetails() {
        this.totalPaid = 0;
        this.totalUnpaid = 0;
        let tempList: any = [];

        this.dataStore.transferLocalStorageDataToList("transactions").forEach((transaction: any) => {
            if (transaction.type == 'borrow' || transaction.type == 'tolend') { tempList.push(transaction); }
        });

        this.payments = this.dataStore.organiseData(tempList, 'itemName');
        this.payments.forEach((payment: any) => {
            this.totalPaid = this.totalPaid + payment.totalLended;
            this.totalUnpaid = this.totalUnpaid + payment.totalBorrowed;
        });
    }

    progress: any = 0;

    updateProgress(monthName: any, expenseOfTheMonth: any) {
        this.progress = expenseOfTheMonth*100/parseInt(this.apiService.getItemFromLocal(this.datePipe.transform(new Date(), "ddMMyyyy")));
        if (this.progress < 100) {
            this.progress += 10; // Increase progress by 10%
            // const progressBar:any = document.getElementById('progressBar');
            // progressBar.style.width = this.progress + '%';
            // progressBar.textContent = this.progress + '%'; // Display progress percentage
        }
    }

}
