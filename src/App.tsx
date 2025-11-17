import * as React from "react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import { Camera, Upload, Zap } from "lucide-react";

export default function App() {
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) return toast.error("No image selected");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResults(data);
      toast.success(`Detected ${data.detections?.length || 0} cracks!`);
    } catch (err) {
      toast.error("AI analysis failed — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-10 text-foreground">LayerTool</h1>
      <div className="w-full max-w-md space-y-6">

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          size="lg"
          className="w-full h-14 text-lg flex gap-3"
          disabled={loading}
        >
          <Camera className="w-6 h-6" />
          Scan Surface with Camera
        </Button>

        {preview && (
          <div className="relative rounded-xl overflow-hidden shadow-xl">
            <img src={preview} alt="Captured" className="w-full" />
            {loading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Skeleton className="w-16 h-16 rounded-full" />
              </div>
            )}
          </div>
        )}

        {preview && !results && (
          <Button onClick={analyze} size="lg" className="w-full h-14 text-lg flex gap-3" disabled={loading}>
            <Zap className="w-6 h-6" />
            Analyze for Cracks
          </Button>
        )}

        {results && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="w-full">
                View Results — {results.detections?.length || 0} cracks found
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>AI Analysis Complete</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {results.detections?.length > 0 ? `${results.detections.length} cracks detected` : "No cracks found!"}
                  </p>
                  <p className="text-lg text-muted-foreground mt-2">
                    Severity: <span className="font-bold">{results.severity || "Low"}</span>
                  </p>
                </div>
                {results.detections?.map((det: any, i: number) => (
                  <div key={i} className="bg-muted rounded-lg p-4 text-sm">
                    <p>Crack #{i + 1}</p>
                    <p>Confidence: {(det.score * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}
