"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icons } from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { faker } from "@faker-js/faker";

interface Expense {
  Date: Date;
  "Numero de Carte": string;
  Description: string;
  Categorie: string;
  Debit: number;
  Credit: number;
}

interface MonthlyExpense {
  month: string;
  year: number;
  expenses: number;
  period: string;
}

interface YearlyExpense {
  year: number;
  expenses: number;
  period: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isDemo = searchParams.get("demo") === "true";

  const [csvData, setCsvData] = useState<Expense[]>([]);
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
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(isDemo);
  const [isUploading, setIsUploading] = useState(false);
  const [visibleMonthlyCount, setVisibleMonthlyCount] = useState(12);

  // Search state
  const [search, setSearch] = useState("");
  // Sorting state
  const [sortColumn, setSortColumn] = useState<keyof Expense | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#a4de6c",
    "#d0ed57",
    "#ffc658",
    "#ff7300",
    "#8dd1e1",
    "#a4262c",
  ];

  const parseCSV = useCallback(async (file: File) => {
    const text = await file.text();
    const lines = text.split("\n");
    const headers = lines[0].split(";").map((header: string) => header.trim());
    const data: Expense[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(";").map((value: string) => value.trim());
      if (values.length === headers.length) {
        const entry: any = {};
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          let value = values[j].replace(/^"|"$/g, ""); // Remove quotes

          if (header === "Debit" || header === "Credit") {
            entry[header] = parseFloat(value || "0");
          } else if (header === "Date") {
            try {
              entry[header] = new Date(value);
            } catch (error) {
              console.error(`Error parsing date ${value}:`, error);
              entry[header] = null;
            }
          } else {
            entry[header] = value;
          }
        }
        data.push(entry as Expense);
      }
    }

    return data;
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          const data = await parseCSV(file);
          setCsvData(data);
          setCurrentPage(1); // Reset to first page on new file upload
          setSearch(""); // Clear search on new file upload

          // Remove demo flag if it exists
          if (isDemo) {
            // Create new URLSearchParams without the demo parameter
            const params = new URLSearchParams(searchParams.toString());
            params.delete("demo");

            // Update URL without the demo parameter
            router.replace(
              pathname + (params.toString() ? `?${params.toString()}` : "")
            );
          }
        } catch (error) {
          console.error("Error parsing CSV:", error);
          // You could add error handling UI here
        } finally {
          setIsUploading(false);
        }
      }
    },
    [parseCSV, isDemo, router, pathname, searchParams]
  );

  useEffect(() => {
    if (isDemo && csvData.length === 0) {
      generateDemoData();
    }
  }, [isDemo]);

  const generateDemoData = () => {
    // Create data for the past 2 years
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);

    const categories = [
      "Grocery",
      "Restaurant",
      "Entertainment",
      "Transportation",
      "Utilities",
      "Shopping",
      "Travel",
      "Healthcare",
      "Education",
      "Housing",
    ];

    // Generate between 300-500 expenses
    const numberOfExpenses = faker.number.int({ min: 300, max: 500 });
    const expenses: Expense[] = [];

    for (let i = 0; i < numberOfExpenses; i++) {
      // Create a random date between start date and now
      const date = faker.date.between({ from: startDate, to: new Date() });

      // Generate a more realistic transaction pattern
      // Higher expenses for certain categories
      const category = faker.helpers.arrayElement(categories);
      let amount = 0;

      switch (category) {
        case "Grocery":
          amount =
            Math.round(faker.number.float({ min: 30, max: 200 }) * 100) / 100;
          break;
        case "Restaurant":
          amount =
            Math.round(faker.number.float({ min: 20, max: 150 }) * 100) / 100;
          break;
        case "Entertainment":
          amount =
            Math.round(faker.number.float({ min: 10, max: 100 }) * 100) / 100;
          break;
        case "Transportation":
          amount =
            Math.round(faker.number.float({ min: 5, max: 80 }) * 100) / 100;
          break;
        case "Utilities":
          amount =
            Math.round(faker.number.float({ min: 50, max: 300 }) * 100) / 100;
          break;
        case "Shopping":
          amount =
            Math.round(faker.number.float({ min: 20, max: 500 }) * 100) / 100;
          break;
        case "Travel":
          amount =
            Math.round(faker.number.float({ min: 200, max: 2000 }) * 100) / 100;
          break;
        case "Healthcare":
          amount =
            Math.round(faker.number.float({ min: 20, max: 300 }) * 100) / 100;
          break;
        case "Education":
          amount =
            Math.round(faker.number.float({ min: 50, max: 800 }) * 100) / 100;
          break;
        case "Housing":
          amount =
            Math.round(faker.number.float({ min: 500, max: 2000 }) * 100) / 100;
          break;
        default:
          amount =
            Math.round(faker.number.float({ min: 10, max: 200 }) * 100) / 100;
      }

      // Occasionally create credit instead of debit
      const isCredit = faker.number.int({ min: 1, max: 20 }) === 1; // 5% chance of being credit

      expenses.push({
        Date: date,
        "Numero de Carte": faker.finance.creditCardNumber("####"),
        Description: `${category} - ${faker.company.name()}`,
        Categorie: category,
        Debit: isCredit ? 0 : amount,
        Credit: isCredit ? amount : 0,
      });
    }

    // Sort expenses by date (newest first)
    expenses.sort((a, b) => b.Date.getTime() - a.Date.getTime());

    setCsvData(expenses);
    setIsGeneratingDemo(false);
  };

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthName = now.toLocaleString("default", { month: "long" });

    // Calculate monthly expenses
    const monthlyExpensesMap: { [monthYear: string]: number } = {};

    csvData.forEach((item) => {
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
    csvData.forEach((item) => {
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
  }, [csvData]);

  // Get current items for pagination
  const filteredData = csvData.filter((item) => {
    const searchableFields = [
      item.Date?.toLocaleDateString(),
      item["Numero de Carte"],
      item.Description,
      item.Categorie,
      item.Debit?.toFixed(2),
      item.Credit?.toFixed(2),
    ];
    return searchableFields.some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    );
  });

  useEffect(() => {
    // Calculate total debits from search
    const totalDebits = filteredData.reduce(
      (sum, item) => sum + (item.Debit || 0),
      0
    );
    setTotalDebitsFromSearch(totalDebits);
  }, [filteredData]);

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue == null || bValue == null) {
      return 0;
    }

    let comparison = 0;
    if (aValue < bValue) {
      comparison = -1;
    } else if (aValue > bValue) {
      comparison = 1;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handlePeriodClick = (period: string) => {
    // Process the data first before opening the dialog
    const periodData = csvData.filter((item) => {
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

  const handleSort = (column: keyof Expense) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const yearlyExpenseData = yearlyExpenses
    .map((item, index, array) => {
      const prevItem = index < array.length - 1 ? array[index + 1] : null;
      const percentChange = prevItem
        ? ((item.expenses - prevItem.expenses) / prevItem.expenses) * 100
        : 0;

      return {
        name: String(item.year),
        expenses: item.expenses,
        percentChange: percentChange.toFixed(2),
      };
    })
    .reverse();

  const visibleMonthlyExpenses = monthlyExpenses.slice(0, visibleMonthlyCount);

  const monthlyExpenseData = visibleMonthlyExpenses
    .map((item, index, array) => {
      // Convert full month name to 3-letter abbreviation with year
      const shortMonth = item.month.substring(0, 3);

      // Include the year with each month for clear timeline
      const displayName = `${shortMonth} '${String(item.year).slice(2)}`;

      const prevItem = index < array.length - 1 ? array[index + 1] : null;
      const percentChange = prevItem
        ? ((item.expenses - prevItem.expenses) / prevItem.expenses) * 100
        : 0;

      return {
        name: displayName,
        expenses: item.expenses,
        fullName: `${item.month} ${item.year}`,
        year: item.year,
        percentChange: percentChange.toFixed(2),
      };
    })
    .reverse();

  // Group months by year for the x-axis
  const yearGroups = monthlyExpenseData.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = [];
    }
    acc[item.year].push(item);
    return acc;
  }, {} as Record<number, typeof monthlyExpenseData>);

  // Calculate tick positions for year labels - improved to ensure all years are shown
  const yearTickPositions = Object.entries(yearGroups).map(([year, months]) => {
    // For each year, return positions for both start and middle for better labeling
    const yearPosition = monthlyExpenseData.findIndex(
      (item) => item.year === parseInt(year)
    );

    // If this is the first month of the year or the only month in a year, mark it
    const isFirstMonth = yearPosition >= 0;

    return {
      year,
      position: yearPosition,
      isFirstMonth,
    };
  });

  const clearData = () => {
    setCsvData([]);
    setMonthlyExpenses([]);
    setYearlyExpenses([]);
    setSelectedPeriod(null);
    setPeriodCategoryData([]);
    setPeriodAllCategories([]);
    setSearch("");
    setSortColumn(null);
    setCurrentPage(1);
    setVisibleMonthlyCount(12);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5 flex items-center">
        <Icons.dollarSign className="mr-2 h-6 w-6" />
        Expense Tracker
      </h1>

      {isDemo && (
        <div className="bg-blue-50 p-4 mb-6 rounded-md border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <Icons.help className="mr-2 h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> Browsing sample generated expense
                data. This data is randomly generated and does not represent
                real transactions.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-blue-600 border-blue-300 bg-transparent hover:bg-blue-100"
              onClick={() => {
                router.replace(pathname);
                setCsvData([]);
              }}
            >
              Exit Demo Mode
            </Button>
          </div>
        </div>
      )}

      {!isDemo && !csvData.length && (
        <div className="bg-green-50 p-4 mb-6 rounded-md border border-green-200">
          <div className="flex items-start">
            <Icons.help className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                About this app
              </h3>
              <p className="text-sm text-green-700 mb-2">
                This app visualizes your expense data from CSV files exported
                from the BNC dashboard. It helps you understand your spending
                patterns through time-based analysis and category breakdowns.
              </p>
              <p className="text-sm text-green-700">
                <strong>How to use:</strong> Export your transaction data as CSV
                from your BNC dashboard and upload it here. All processing
                happens locally in your browser - no data is sent to any server.
              </p>
            </div>
          </div>
        </div>
      )}

      {!csvData.length && !isGeneratingDemo && !isUploading ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <div className="grid place-items-center py-10">
              <Icons.file className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg text-muted-foreground">
                Upload a CSV file to get started
              </p>
              <div className="mt-6">
                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100"
                >
                  <a href="?demo=true">Try Demo Mode</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isGeneratingDemo || isUploading ? (
        <Card>
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg text-muted-foreground">
                {isGeneratingDemo
                  ? "Generating demo data..."
                  : "Processing CSV file..."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-5 bg-muted p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Your data is processed locally and is not stored on any server.
                Refresh the page or click "Clear Data" to remove all imported
                data.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Tip:</strong> Click on any monthly or yearly record to
                see a detailed category breakdown. Use the Transaction Details
                section below to search and sort through individual
                transactions.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearData}
              size="lg"
              className="whitespace-nowrap bg-black text-white hover:bg-black/90 shrink-0"
            >
              <Icons.trash className="mr-2 h-4 w-4" />
              Clear Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mb-5">
            <Card className="md:col-span-1 lg:col-span-6">
              <CardHeader>
                <CardTitle>Yearly Expenses</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Year</TableHead>
                        <TableHead>Expenses</TableHead>
                        <TableHead className="w-[80px] text-center">
                          Trend
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearlyExpenses.map(
                        ({ year, expenses, period }, index) => {
                          const prevExpense =
                            index < yearlyExpenses.length - 1
                              ? yearlyExpenses[index + 1].expenses
                              : null;
                          const isIncrease =
                            prevExpense !== null
                              ? expenses > prevExpense
                              : false;

                          return (
                            <TableRow
                              key={year}
                              onClick={() => handlePeriodClick(period)}
                              className="cursor-pointer hover:bg-accent/50"
                            >
                              <TableCell className="font-medium">
                                {year}
                              </TableCell>
                              <TableCell>
                                {expenses.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })}
                              </TableCell>
                              <TableCell className="text-center">
                                {prevExpense !== null && (
                                  <>
                                    {isIncrease ? (
                                      <Icons.arrowRight className="inline-block w-4 h-4 -rotate-90 text-red-500" />
                                    ) : (
                                      <Icons.arrowRight className="inline-block w-4 h-4 rotate-90 text-green-500" />
                                    )}
                                    <span
                                      className={
                                        isIncrease
                                          ? "text-red-500 ml-1"
                                          : "text-green-500 ml-1"
                                      }
                                    >
                                      {isIncrease ? "+" : "-"}
                                      {Math.abs(
                                        ((expenses - prevExpense) /
                                          prevExpense) *
                                          100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Trend</h3>
                  <div className="text-xs text-muted-foreground mb-2">
                    Click on data points to view category breakdown
                  </div>
                  <div className="w-full h-[250px] sm:h-[300px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={yearlyExpenseData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                        onClick={(data) => {
                          if (
                            data &&
                            data.activePayload &&
                            data.activePayload.length > 0
                          ) {
                            const clickedData = data.activePayload[0].payload;
                            handlePeriodClick(clickedData.name);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          height={40}
                          interval={0} // Show all ticks
                        />
                        <YAxis
                          tickFormatter={(value) => `$${value}`}
                          width={60}
                        />
                        <Tooltip
                          formatter={(value: number) => `$${value.toFixed(2)}`}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                          }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const percentChange = Number(data.percentChange);
                              const sign = percentChange >= 0 ? "+" : "";
                              // Since decrease in expenses is good, reverse the color logic
                              const changeClass =
                                percentChange >= 0
                                  ? "text-red-600"
                                  : "text-green-600";

                              return (
                                <div className="p-3 bg-white shadow-md rounded-md">
                                  <p className="font-medium">{label}</p>
                                  <p className="text-gray-900">
                                    {data.expenses.toLocaleString("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                    })}
                                  </p>
                                  <p className={changeClass}>
                                    {sign}
                                    {data.percentChange}% from previous period
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          fill="#82ca9d"
                          fillOpacity={0.3}
                          stroke="none"
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          activeDot={{ r: 8, className: "cursor-pointer" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1 lg:col-span-6">
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Month</TableHead>
                        <TableHead className="w-[100px]">Year</TableHead>
                        <TableHead>Expenses</TableHead>
                        <TableHead className="w-[80px] text-center">
                          Trend
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleMonthlyExpenses.map(
                        ({ month, year, expenses, period }, index) => {
                          const prevExpense =
                            index < visibleMonthlyExpenses.length - 1
                              ? visibleMonthlyExpenses[index + 1].expenses
                              : null;
                          const isIncrease =
                            prevExpense !== null
                              ? expenses > prevExpense
                              : false;

                          return (
                            <TableRow
                              key={`${month}-${year}`}
                              onClick={() => handlePeriodClick(period)}
                              className="cursor-pointer hover:bg-accent/50"
                            >
                              <TableCell className="font-medium">
                                {month}
                              </TableCell>
                              <TableCell className="font-medium">
                                {year}
                              </TableCell>
                              <TableCell>
                                {expenses.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })}
                              </TableCell>
                              <TableCell className="text-center">
                                {prevExpense !== null && (
                                  <>
                                    {isIncrease ? (
                                      <Icons.arrowRight className="inline-block w-4 h-4 -rotate-90 text-red-500" />
                                    ) : (
                                      <Icons.arrowRight className="inline-block w-4 h-4 rotate-90 text-green-500" />
                                    )}
                                    <span
                                      className={
                                        isIncrease
                                          ? "text-red-500 ml-1"
                                          : "text-green-500 ml-1"
                                      }
                                    >
                                      {isIncrease ? "+" : "-"}
                                      {Math.abs(
                                        ((expenses - prevExpense) /
                                          prevExpense) *
                                          100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                  {visibleMonthlyCount < monthlyExpenses.length && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setVisibleMonthlyCount((prev) => prev + 12)
                        }
                        className="text-muted-foreground"
                      >
                        <Icons.more className="mr-2 h-4 w-4" />
                        Show More
                      </Button>
                    </div>
                  )}
                </div>
                <div className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Trend</h3>
                  <div className="text-xs text-muted-foreground mb-2">
                    Click on data points to view category breakdown
                  </div>
                  <div className="w-full h-[250px] sm:h-[300px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyExpenseData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 50 }}
                        onClick={(data) => {
                          if (
                            data &&
                            data.activePayload &&
                            data.activePayload.length > 0
                          ) {
                            const clickedData = data.activePayload[0].payload;
                            const period = clickedData.fullName;
                            if (period) {
                              handlePeriodClick(period);
                            }
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          height={50}
                          tickLine={false}
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          fontSize={10}
                        />
                        <YAxis
                          tickFormatter={(value) => `$${value}`}
                          width={60}
                        />
                        <Tooltip
                          formatter={(value: number) => `$${value.toFixed(2)}`}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                          }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const percentChange = Number(data.percentChange);
                              const sign = percentChange >= 0 ? "+" : "";
                              // Since decrease in expenses is good, reverse the color logic
                              const changeClass =
                                percentChange >= 0
                                  ? "text-red-600"
                                  : "text-green-600";

                              return (
                                <div className="p-3 bg-white shadow-md rounded-md">
                                  <p className="font-medium">
                                    {data.fullName || label}
                                  </p>
                                  <p className="text-gray-900">
                                    {data.expenses.toLocaleString("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                    })}
                                  </p>
                                  <p className={changeClass}>
                                    {sign}
                                    {data.percentChange}% from previous period
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          fill="#8884d8"
                          fillOpacity={0.3}
                          stroke="none"
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke="#8884d8"
                          strokeWidth={2}
                          activeDot={{ r: 8, className: "cursor-pointer" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[900px] sm:max-h-[90vh] p-6 bg-card">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl">
                  Category Breakdown for {selectedPeriod}
                </DialogTitle>
              </DialogHeader>
              {selectedPeriod && periodCategoryData.length > 0 && (
                <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Category Distribution
                  </h3>
                  <div className="w-full h-[35vh] sm:h-[400px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        style={{ outline: "none" }}
                        tabIndex={-1}
                      >
                        <Tooltip
                          formatter={(value: number) => `$${value.toFixed(2)}`}
                        />
                        <Pie
                          data={periodCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={110}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent, index }) => {
                            // Only show labels for the top 10 categories (index 0-9)
                            if (index >= 10) return null;

                            // Truncate long category names
                            const displayName =
                              name.length > 20
                                ? `${name.substring(0, 18)}...`
                                : name;
                            return `${displayName}: ${(percent * 100).toFixed(
                              0
                            )}%`;
                          }}
                        >
                          {periodCategoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === "Others"
                                  ? "#CCCCCC"
                                  : COLORS[index % COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-base font-medium mt-4 mb-6 p-3 border-t border-b flex items-center gap-2">
                    <span>Total Expenses:</span>
                    <span className="text-lg font-bold">
                      {periodAllCategories && periodAllCategories.length > 0
                        ? periodAllCategories
                            .reduce((sum, category) => sum + category.value, 0)
                            .toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })
                        : "$0.00"}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-3">
                    Category Expenses
                  </h3>
                  <div className="rounded-md border max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {periodAllCategories
                          .sort((a, b) => b.value - a.value)
                          .map((item, index) => {
                            const totalExpenses = periodAllCategories.reduce(
                              (sum, category) => sum + category.value,
                              0
                            );
                            const percentage =
                              (item.value / totalExpenses) * 100;

                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {item.name}
                                </TableCell>
                                <TableCell>
                                  {item.value.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  })}
                                </TableCell>
                                <TableCell>{percentage.toFixed(2)}%</TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Accordion type="single" collapsible>
            <AccordionItem value="raw-data">
              <AccordionTrigger>Transaction Details</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                  <div className="mb-2 md:mb-0">
                    <p>
                      <strong>Transactions:</strong> {filteredData.length}
                    </p>
                    <p>
                      <strong>Total Debits:</strong>{" "}
                      {totalDebitsFromSearch.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Search transactions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="max-w-xs"
                    />
                    <Icons.search className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          onClick={() => handleSort("Date")}
                          className="cursor-pointer"
                        >
                          Date
                          {sortColumn === "Date" &&
                            (sortOrder === "asc" ? (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1" />
                            ) : (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1 rotate-180" />
                            ))}
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("Numero de Carte")}
                          className="cursor-pointer"
                        >
                          Numero de Carte
                          {sortColumn === "Numero de Carte" &&
                            (sortOrder === "asc" ? (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1" />
                            ) : (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1 rotate-180" />
                            ))}
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("Description")}
                          className="cursor-pointer"
                        >
                          Description
                          {sortColumn === "Description" &&
                            (sortOrder === "asc" ? (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1" />
                            ) : (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1 rotate-180" />
                            ))}
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("Categorie")}
                          className="cursor-pointer"
                        >
                          Categorie
                          {sortColumn === "Categorie" &&
                            (sortOrder === "asc" ? (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1" />
                            ) : (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1 rotate-180" />
                            ))}
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("Debit")}
                          className="cursor-pointer"
                        >
                          Debit
                          {sortColumn === "Debit" &&
                            (sortOrder === "asc" ? (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1" />
                            ) : (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1 rotate-180" />
                            ))}
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("Credit")}
                          className="cursor-pointer"
                        >
                          Credit
                          {sortColumn === "Credit" &&
                            (sortOrder === "asc" ? (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1" />
                            ) : (
                              <Icons.arrowRight className="inline-block w-4 h-4 ml-1 rotate-180" />
                            ))}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((item, index) => (
                        <TableRow key={index} className="h-[50px]">
                          <TableCell>
                            {item.Date?.toLocaleDateString()}
                          </TableCell>
                          <TableCell>{item["Numero de Carte"]}</TableCell>
                          <TableCell>{item.Description}</TableCell>
                          <TableCell>{item.Categorie}</TableCell>
                          <TableCell>{item.Debit?.toFixed(2)}</TableCell>
                          <TableCell>{item.Credit?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="items-per-page">Items per page:</Label>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1); // Reset to first page on change
                      }}
                    >
                      <SelectTrigger id="items-per-page" className="w-[70px]">
                        <SelectValue placeholder={String(itemsPerPage)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Pagination controls */}
                  <div className="flex justify-center space-x-2">
                    <Button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 p-0"
                    >
                      <Icons.arrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <span className="flex items-center mx-2">
                      Page {currentPage} of{" "}
                      {Math.ceil(sortedData.length / itemsPerPage)}
                    </span>
                    <Button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={indexOfLastItem >= sortedData.length}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 p-0"
                    >
                      <Icons.arrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  );
}
