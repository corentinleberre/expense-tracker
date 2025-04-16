import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";

export interface YearlyExpense {
  year: number;
  expenses: number;
  period: string;
}

interface YearlyExpensesCardProps {
  yearlyExpenses: YearlyExpense[];
  handlePeriodClick: (period: string) => void;
}

export function YearlyExpensesCard({
  yearlyExpenses,
  handlePeriodClick,
}: YearlyExpensesCardProps) {
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

  return (
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
                <TableHead className="w-[80px] text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearlyExpenses.map(({ year, expenses, period }, index) => {
                const prevExpense =
                  index < yearlyExpenses.length - 1
                    ? yearlyExpenses[index + 1].expenses
                    : null;
                const isIncrease =
                  prevExpense !== null ? expenses > prevExpense : false;

                return (
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
                              ((expenses - prevExpense) / prevExpense) * 100
                            ).toFixed(1)}
                            %
                          </span>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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
                <YAxis tickFormatter={(value) => `$${value}`} width={60} />
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
                        percentChange >= 0 ? "text-red-600" : "text-green-600";

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
  );
}
