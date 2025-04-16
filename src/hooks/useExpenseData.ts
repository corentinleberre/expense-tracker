import { useState, useEffect } from "react";
import { Expense } from "@/components/TransactionDetails";
import { MonthlyExpense } from "@/components/MonthlyExpensesCard";
import { YearlyExpense } from "@/components/YearlyExpensesCard";

export function useExpenseData(data: Expense[]) {
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [yearlyExpenses, setYearlyExpenses] = useState<YearlyExpense[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [periodCategoryData, setPeriodCategoryData] = useState<
    { name: string; value: number }[]
  >([]);
  const [periodAllCategories, setPeriodAllCategories] = useState<
    { name: string; value: number }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [totalDebitsFromSearch, setTotalDebitsFromSearch] = useState(0);

  // Calculate expenses by month and year
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthName = now.toLocaleString("default", { month: "long" });

    // Calculate monthly expenses
    const monthlyExpensesMap: { [monthYear: string]: number } = {};

    data.forEach((item) => {
      if (!item.Date) return; // Skip if the date is invalid

      const itemDate = new Date(item.Date);
      const monthName = itemDate.toLocaleString("default", { month: "long" });
      const year = itemDate.getFullYear();
      const monthYear = `${monthName} ${year}`;

      if (!monthlyExpensesMap[monthYear]) {
        monthlyExpensesMap[monthYear] = 0;
      }
      monthlyExpensesMap[monthYear] += item.Debit;
    });

    // Convert map to array of MonthlyExpense objects
    let newMonthlyExpenses: MonthlyExpense[] = Object.entries(
      monthlyExpensesMap
    )
      .map(([monthYear, expenses]) => {
        const [month, year] = monthYear.split(" ");
        return { month, year: parseInt(year), expenses, period: monthYear };
      })
      .sort((a, b) => {
        const monthOrder: { [key: string]: number } = {
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          May: 5,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12,
        };
        if (b.year !== a.year) {
          return b.year - a.year; // Sort by year in reverse chronological order
        }
        return monthOrder[b.month] - monthOrder[a.month]; // Then, sort by month in reverse chronological order
      });

    // Find current month's expenses and move to the top
    const currentMonthIndex = newMonthlyExpenses.findIndex(
      (item) => item.month === currentMonthName && item.year === currentYear
    );
    if (currentMonthIndex > 0) {
      const [currentMonthExpense] = newMonthlyExpenses.splice(
        currentMonthIndex,
        1
      );
      newMonthlyExpenses.unshift(currentMonthExpense);
    }

    setMonthlyExpenses(newMonthlyExpenses);

    // Calculate yearly expenses
    const yearlyExpensesMap: { [year: number]: number } = {};
    data.forEach((item) => {
      if (!item.Date) return; // Skip if the date is invalid

      const itemDate = new Date(item.Date);
      const year = itemDate.getFullYear();
      if (!yearlyExpensesMap[year]) {
        yearlyExpensesMap[year] = 0;
      }
      yearlyExpensesMap[year] += item.Debit;
    });

    // Convert map to array of YearlyExpense objects
    let newYearlyExpenses: YearlyExpense[] = Object.entries(yearlyExpensesMap)
      .map(([year, expenses]) => ({
        year: parseInt(year),
        expenses,
        period: String(year),
      }))
      .sort((a, b) => b.year - a.year); // Sort in reverse chronological order

    // Find current year's expenses and move to the top
    const currentYearNumber = now.getFullYear();
    const currentYearIndex = newYearlyExpenses.findIndex(
      (item) => item.year === currentYearNumber
    );
    if (currentYearIndex > 0) {
      const [currentYearExpense] = newYearlyExpenses.splice(
        currentYearIndex,
        1
      );
      newYearlyExpenses.unshift(currentYearExpense);
    }

    setYearlyExpenses(newYearlyExpenses);
  }, [data]);

  // Get filtered data and calculate total debits
  useEffect(() => {
    // Get all data (no filtering applied here)
    const filteredData = data.filter((item) => {
      const searchableFields = [
        item.Date?.toLocaleDateString(),
        item["Numero de Carte"],
        item.Description,
        item.Categorie,
        item.Debit?.toFixed(2),
        item.Credit?.toFixed(2),
      ];
      return searchableFields.some((field) =>
        field?.toLowerCase().includes("")
      );
    });

    // Calculate total debits from search
    const totalDebits = filteredData.reduce(
      (sum, item) => sum + (item.Debit || 0),
      0
    );
    setTotalDebitsFromSearch(totalDebits);
  }, [data]);

  const handlePeriodClick = (period: string) => {
    // Process the data first before opening the dialog
    const periodData = data.filter((item) => {
      if (!item.Date) return false;
      const itemDate = new Date(item.Date);
      const monthName = itemDate.toLocaleString("default", { month: "long" });
      const year = itemDate.getFullYear();
      const itemPeriod = isNaN(Number(period))
        ? `${monthName} ${year}`
        : String(year);
      return itemPeriod === period;
    });

    const categoryTotals: { [key: string]: number } = {};
    periodData.forEach((item) => {
      if (item.Categorie) {
        categoryTotals[item.Categorie] =
          (categoryTotals[item.Categorie] || 0) + item.Debit;
      }
    });

    // Convert to array and sort by value (highest first)
    const sortedCategories = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Store all categories for the table
    const allCategories = [...sortedCategories];

    // Take top 10 categories and group the rest as "Others" for the pie chart
    let finalChartData;
    if (sortedCategories.length > 10) {
      const top10 = sortedCategories.slice(0, 10);
      const othersValue = sortedCategories
        .slice(10)
        .reduce((acc, curr) => acc + curr.value, 0);

      finalChartData = [...top10, { name: "Others", value: othersValue }];
    } else {
      finalChartData = sortedCategories;
    }

    // Set data first
    setPeriodCategoryData(finalChartData);
    setPeriodAllCategories(allCategories);
    setSelectedPeriod(period);

    // Then open dialog
    setOpen(true);
  };

  const clearData = () => {
    setMonthlyExpenses([]);
    setYearlyExpenses([]);
    setSelectedPeriod(null);
    setPeriodCategoryData([]);
    setPeriodAllCategories([]);
  };

  return {
    monthlyExpenses,
    yearlyExpenses,
    selectedPeriod,
    periodCategoryData,
    periodAllCategories,
    open,
    setOpen,
    totalDebitsFromSearch,
    handlePeriodClick,
    clearData,
  };
}
