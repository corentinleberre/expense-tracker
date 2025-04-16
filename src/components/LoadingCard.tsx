import { Card, CardContent } from "@/components/ui/card";

interface LoadingCardProps {
  message: string;
}

export function LoadingCard({ message }: LoadingCardProps) {
  return (
    <Card>
      <CardContent className="p-10">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
