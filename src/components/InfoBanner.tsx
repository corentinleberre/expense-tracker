import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface InfoBannerProps {
  type: "demo" | "about";
  onExit?: () => void;
  pathname?: string;
  router?: any;
}

export function InfoBanner({
  type,
  onExit,
  pathname,
  router,
}: InfoBannerProps) {
  if (type === "demo") {
    return (
      <div className="bg-blue-50 dark:bg-blue-950 p-4 mb-6 rounded-md border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <Icons.help className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Demo Mode:</strong> Browsing sample generated expense
              data. This data is randomly generated and does not represent real
              transactions.
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-700 bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900"
            onClick={() => {
              if (onExit) {
                onExit();
              }
              if (pathname) {
                // Force navigation to the base URL without query parameters
                window.location.href = pathname;
              }
            }}
          >
            Exit Demo Mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-950 p-4 mb-6 rounded-md border border-green-200 dark:border-green-800">
      <div className="flex items-start">
        <Icons.help className="mr-2 h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
            About this app
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400 mb-2">
            This app visualizes your expense data from CSV files exported from
            the BNC dashboard. It helps you understand your spending patterns
            through time-based analysis and category breakdowns.
          </p>
          <p className="text-sm text-green-700 dark:text-green-400">
            <strong>How to use:</strong> Export your transaction data as CSV
            from your BNC dashboard and upload it here. All processing happens
            locally in your browser - no data is sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
}
