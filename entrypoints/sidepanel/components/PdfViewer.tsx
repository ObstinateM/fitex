import { useEffect, useState } from "react";

interface PdfViewerProps {
  blob: Blob;
}

export default function PdfViewer({ blob }: PdfViewerProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl + "#toolbar=0");
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (!url) return null;

  return (
    <iframe
      src={url}
      className="h-[400px] w-full rounded-lg border border-gray-200"
      title="Tailored CV Preview"
    />
  );
}
