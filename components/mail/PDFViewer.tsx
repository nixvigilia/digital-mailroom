"use client";

import {useState, useEffect} from "react";
import {Box, Loader, Center, Text, Button} from "@mantine/core";
import {IconFileText, IconAlertCircle, IconDownload} from "@tabler/icons-react";
import {Image} from "@mantine/core";

interface PDFViewerProps {
  url: string;
  alt?: string;
  height?: number | string;
  width?: string;
}

export function PDFViewer({
  url,
  alt = "Document",
  height = 600,
  width = "100%",
}: PDFViewerProps) {
  const [isPDF, setIsPDF] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Check if URL is a PDF by extension
    const checkFileType = () => {
      try {
        const urlLower = url.toLowerCase();
        // Check for .pdf extension or PDF in the path
        const isPDFFile =
          urlLower.endsWith(".pdf") ||
          urlLower.includes(".pdf") ||
          urlLower.includes("/pdf") ||
          urlLower.includes("application/pdf");

        setIsPDF(isPDFFile);
        setLoading(false);
      } catch (err) {
        // Default to PDF if we can't determine
        setIsPDF(true);
        setLoading(false);
      }
    };

    checkFileType();
  }, [url]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const handleImageError = () => {
    // If image fails, try as PDF
    if (!isPDF) {
      setIsPDF(true);
      setLoading(false);
    } else {
      setError(true);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading && !iframeLoaded) {
    return (
      <Center
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          width,
          backgroundColor: "var(--mantine-color-gray-1)",
          borderRadius: "var(--mantine-radius-md)",
        }}
      >
        <Loader size="md" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          width,
          backgroundColor: "var(--mantine-color-gray-1)",
          borderRadius: "var(--mantine-radius-md)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "md",
          padding: "xl",
        }}
      >
        <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
        <Text c="dimmed" size="sm" ta="center">
          Failed to load document. Please try downloading it instead.
        </Text>
        <Button
          variant="light"
          leftSection={<IconDownload size={16} />}
          onClick={handleDownload}
        >
          Download Document
        </Button>
      </Box>
    );
  }

  if (isPDF) {
    return (
      <Box
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          width,
          borderRadius: "var(--mantine-radius-md)",
          overflow: "hidden",
          backgroundColor: "var(--mantine-color-gray-1)",
          border: "1px solid var(--mantine-color-gray-3)",
          position: "relative",
        }}
      >
        {!iframeLoaded && (
          <Center
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "var(--mantine-color-gray-1)",
              zIndex: 1,
            }}
          >
            <Loader size="md" />
          </Center>
        )}
        <iframe
          src={`${url}#view=FitH&toolbar=0`}
          title={alt}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: iframeLoaded ? "block" : "none",
          }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </Box>
    );
  }

  // For images, use the Image component
  return (
    <Box
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width,
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
        backgroundColor: "var(--mantine-color-gray-1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src={url}
        alt={alt}
        fit="contain"
        style={{maxHeight: "100%", maxWidth: "100%"}}
        onError={handleImageError}
      />
    </Box>
  );
}







