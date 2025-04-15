"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
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
  Legend,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [csvData, setCsvData] = useState<Expense[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [yearlyExpenses, setYearlyExpenses] = useState<YearlyExpense[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [periodCategoryData, setPeriodCategoryData] = useState<
    { name: string; value: number }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [totalDebitsFromSearch, setTotalDebitsFromSearch] = useState(0);

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
        const data = await parseCSV(file);
        setCsvData(data);
        setCurrentPage(1); // Reset to first page on new file upload
        setSearch(""); // Clear search on new file upload
      }
    },
    [parseCSV]
  );

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
    setSelectedPeriod(period);
    setOpen(true);
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

    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
    setPeriodCategoryData(chartData);
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

  const monthlyExpenseData = monthlyExpenses
    .map((item) => ({
      name: `${item.month} ${item.year}`,
      expenses: item.expenses,
    }))
    .reverse();

  const yearlyExpenseData = yearlyExpenses
    .map((item) => ({
      name: String(item.year),
      expenses: item.expenses,
    }))
    .reverse();

  const clearData = () => {
    setCsvData([]);
    setMonthlyExpenses([]);
    setYearlyExpenses([]);
    setSelectedPeriod(null);
    setPeriodCategoryData([]);
    setSearch("");
    setSortColumn(null);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5 flex items-center">
        <Icons.dollarSign className="mr-2 h-6 w-6" />
        Expense Tracker
      </h1>

      {!csvData.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="file" accept=".csv" onChange={handleFileUpload} />
            <div className="grid place-items-center py-10">
              <Icons.file className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg text-muted-foreground">
                Upload a CSV file to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-5 bg-muted p-4 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">
                Your data is processed locally and is not stored on any server.
                Refresh the page or click "Clear Data" to remove all imported
                data.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearData}
              size="lg"
              className="whitespace-nowrap bg-black text-white hover:bg-black/90"
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearlyExpenses.map(({ year, expenses, period }) => (
                        <TableRow
                          key={year}
                          onClick={() => handlePeriodClick(period)}
                          className="cursor-pointer hover:bg-accent/50"
                        >
                          <TableCell className="font-medium">{year}</TableCell>
                          <TableCell>
                            {expenses.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-auto pt-6">
                  <h3 className="text-lg font-semibold mb-3">Trend</h3>
                  <div className="flex justify-end">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={yearlyExpenseData}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                          formatter={(value: number) => `$${value.toFixed(2)}`}
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
                          activeDot={{ r: 8 }}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyExpenses.map(
                        ({ month, year, expenses, period }) => (
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
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-auto pt-6">
                  <h3 className="text-lg font-semibold mb-3">Trend</h3>
                  <div className="flex justify-end">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyExpenseData}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                          formatter={(value: number) => `$${value.toFixed(2)}`}
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
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[900px] sm:max-h-[600px] p-10 bg-card">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  Category Breakdown for {selectedPeriod}
                </DialogTitle>
              </DialogHeader>
              {selectedPeriod && periodCategoryData.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-3 text-center">
                    Category Distribution
                  </h3>
                  <div className="flex justify-end">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Tooltip
                          formatter={(value: number) => `$${value.toFixed(2)}`}
                        />
                        <Pie
                          data={periodCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={160}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {periodCategoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <Legend className="mt-12" />
                </>
              )}
            </DialogContent>
          </Dialog>

          <Accordion type="single" collapsible>
            <AccordionItem value="raw-data">
              <AccordionTrigger>Raw Data</AccordionTrigger>
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

                <ScrollArea className="h-[400px] w-full rounded-md border">
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
                        <TableRow key={index}>
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
                </ScrollArea>

                <Separator />
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="items-per-page">Items per page:</Label>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(value) => setItemsPerPage(Number(value))}
                    >
                      <SelectTrigger id="items-per-page">
                        <SelectValue placeholder={String(itemsPerPage)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Pagination controls */}
                  <div className="flex justify-center space-x-2">
                    <Button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={indexOfLastItem >= sortedData.length}
                      variant="outline"
                    >
                      Next
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
