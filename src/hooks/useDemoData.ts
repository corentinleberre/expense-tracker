import { useState, useEffect } from "react";
import { faker } from "@faker-js/faker";
import { Expense } from "@/components/TransactionDetails";

export function useDemoData(isDemo: boolean) {
  const [csvData, setCsvData] = useState<Expense[]>([]);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(isDemo);

  useEffect(() => {
    if (isDemo && csvData.length === 0) {
      generateDemoData();
    }
  }, [isDemo, csvData.length]);

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

  const clearData = () => {
    setCsvData([]);
  };

  return {
    csvData,
    isGeneratingDemo,
    clearData,
  };
}
