"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MonthlyExpensesCard } from "@/components/MonthlyExpensesCard";
import { YearlyExpensesCard } from "@/components/YearlyExpensesCard";
import { CategoryBreakdownDialog } from "@/components/CategoryBreakdownDialog";
import { TransactionDetails } from "@/components/TransactionDetails";
import { FileUpload } from "@/components/FileUpload";
import { LoadingCard } from "@/components/LoadingCard";
import { InfoBanner } from "@/components/InfoBanner";
import { DataSummaryBanner } from "@/components/DataSummaryBanner";
import { useDemoData } from "@/hooks/useDemoData";
import { useExpenseData } from "@/hooks/useExpenseData";
import { useCsvParser } from "@/hooks/useCsvParser";

export default function ExpenseTracker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isDemo = searchParams.get("demo") === "true";

  // Custom hooks
  const {
    csvData,
    isGeneratingDemo,
    clearData: clearDemoData,
  } = useDemoData(isDemo);
  const { isUploading, handleFileUpload } = useCsvParser();
  const [uploadedData, setUploadedData] = useState(csvData);

  // Combine demo and uploaded data
  const combinedData = csvData.length > 0 ? csvData : uploadedData;

  const {
    monthlyExpenses,
    yearlyExpenses,
    selectedPeriod,
    periodCategoryData,
    periodAllCategories,
    open,
    setOpen,
    totalDebitsFromSearch,
    handlePeriodClick,
    clearData: clearExpenseData,
  } = useExpenseData(combinedData);

  const handleClearData = () => {
    clearDemoData();
    clearExpenseData();
    setUploadedData([]);

    // Redirect to root page without demo param when in demo mode
    if (isDemo && pathname) {
      // Force navigation to the base URL without query parameters
      window.location.href = pathname;
    }
  };

  const handleFileUploadWrapper = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleFileUpload(event, setUploadedData, isDemo);
  };

  const hasData = combinedData.length > 0;

  return (
    <div className="py-10">
      {isDemo && (
        <InfoBanner
          type="demo"
          onExit={handleClearData}
          pathname={pathname}
          router={router}
        />
      )}

      {!isDemo && !hasData && <InfoBanner type="about" />}

      {!hasData && !isGeneratingDemo && !isUploading ? (
        <FileUpload
          handleFileUpload={handleFileUploadWrapper}
          isUploading={isUploading}
        />
      ) : isGeneratingDemo || isUploading ? (
        <LoadingCard
          message={
            isGeneratingDemo
              ? "Generating demo data..."
              : "Processing CSV file..."
          }
        />
      ) : (
        <>
          <DataSummaryBanner onClear={handleClearData} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mb-5">
            <YearlyExpensesCard
              yearlyExpenses={yearlyExpenses}
              handlePeriodClick={handlePeriodClick}
            />
            <MonthlyExpensesCard
              monthlyExpenses={monthlyExpenses}
              handlePeriodClick={handlePeriodClick}
            />
          </div>

          <CategoryBreakdownDialog
            open={open}
            onOpenChange={setOpen}
            selectedPeriod={selectedPeriod}
            periodCategoryData={periodCategoryData}
            periodAllCategories={periodAllCategories}
          />

          <TransactionDetails
            csvData={combinedData}
            totalDebitsFromSearch={totalDebitsFromSearch}
          />
        </>
      )}
    </div>
  );
}
