import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface DataSummaryBannerProps {
  onClear: () => void;
}

export function DataSummaryBanner({ onClear }: DataSummaryBannerProps) {
  return (
    <div className="mb-5 bg-muted p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Your data is processed locally and is not stored on any server.
          Refresh the page or click "Clear Data" to remove all imported data.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Tip:</strong> Click on any monthly or yearly record to see a
          detailed category breakdown. Use the Transaction Details section below
          to search and sort through individual transactions.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={onClear}
        size="lg"
        className="whitespace-nowrap bg-black text-white hover:bg-black/90 shrink-0"
      >
        <Icons.trash className="mr-2 h-4 w-4" />
        Clear Data
      </Button>
    </div>
  );
}
