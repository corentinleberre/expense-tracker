import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface FileUploadProps {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export function FileUpload({ handleFileUpload, isUploading }: FileUploadProps) {
  return (
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
  );
}
