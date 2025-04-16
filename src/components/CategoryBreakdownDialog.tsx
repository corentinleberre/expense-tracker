import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CategoryBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPeriod: string | null;
  periodCategoryData: { name: string; value: number }[];
  periodAllCategories: { name: string; value: number }[];
}

// Define colors for the pie chart
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

export function CategoryBreakdownDialog({
  open,
  onOpenChange,
  selectedPeriod,
  periodCategoryData,
  periodAllCategories,
}: CategoryBreakdownDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
} 