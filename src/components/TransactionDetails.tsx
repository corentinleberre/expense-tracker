import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Expense {
  Date: Date;
  "Numero de Carte": string;
  Description: string;
  Categorie: string;
  Debit: number;
  Credit: number;
}

interface TransactionDetailsProps {
  csvData: Expense[];
  totalDebitsFromSearch: number;
}

export function TransactionDetails({
  csvData,
  totalDebitsFromSearch,
}: TransactionDetailsProps) {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Expense | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const handleSort = (column: keyof Expense) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
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
                    <TableCell>{item.Date?.toLocaleDateString()}</TableCell>
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
  );
}
