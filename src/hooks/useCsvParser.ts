"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Expense } from "@/components/TransactionDetails";

export function useCsvParser() {
  const [isUploading, setIsUploading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const parseCSV = useCallback(async (file: File): Promise<Expense[]> => {
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
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      onDataParsed: (data: Expense[]) => void,
      isDemo: boolean = false
    ) => {
      const file = event.target.files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          const data = await parseCSV(file);
          onDataParsed(data);

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
    [parseCSV, router, pathname, searchParams]
  );

  return {
    isUploading,
    parseCSV,
    handleFileUpload,
  };
}
