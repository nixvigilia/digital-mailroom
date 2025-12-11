import {NextRequest, NextResponse} from "next/server";
import {verifySession} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import PDFDocument from "pdfkit";

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{transactionId: string}>}
) {
  try {
    const session = await verifySession();
    const userId = session.userId;
    const {transactionId} = await params;

    // Fetch transaction details
    const transaction = await prisma.paymentTransaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        profile: {
          select: {
            email: true,
          },
        },
        subscription: {
          include: {
            package: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {error: "Transaction not found"},
        {status: 404}
      );
    }

    // Verify ownership
    if (transaction.profile_id !== userId) {
      return NextResponse.json({error: "Unauthorized"}, {status: 403});
    }

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(transaction);

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${transaction.external_id || transactionId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", {errorMessage, errorStack});
    return NextResponse.json(
      {
        error: "Failed to generate invoice",
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && {stack: errorStack}),
      },
      {status: 500}
    );
  }
}

async function generateInvoicePDF(transaction: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure transaction has required fields
      if (!transaction) {
        reject(new Error("Transaction data is required"));
        return;
      }

      if (!transaction.profile?.email) {
        reject(new Error("Transaction profile email is missing"));
        return;
      }

      const doc = new PDFDocument({margin: 50, size: "A4"});
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => {
        console.error("PDFDocument error:", err);
        reject(err);
      });

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("KEEP Digital Mailroom", {align: "left"})
        .fontSize(12)
        .font("Helvetica")
        .text("Digital Mailroom Services", {align: "left"})
        .moveDown(2);

      // Invoice details
      const invoiceNumber = transaction.external_id || transaction.id || "N/A";
      const invoiceDate = transaction.paid_at
        ? new Date(transaction.paid_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : transaction.created_at
        ? new Date(transaction.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("INVOICE", {align: "right"})
        .fontSize(10)
        .font("Helvetica")
        .text(`Invoice #: ${invoiceNumber}`, {align: "right"})
        .text(`Date: ${invoiceDate}`, {align: "right"})
        .text(`Status: ${transaction.status}`, {align: "right"})
        .moveDown(2);

      // Bill To section
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Bill To:", 50, 150)
        .font("Helvetica")
        .fontSize(10)
        .text(transaction.profile.email, 50, 170)
        .moveDown(2);

      // Line items table
      const startY = 220;
      let currentY = startY;

      // Table header
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Description", 50, currentY)
        .text("Plan", 250, currentY)
        .text("Payment Method", 350, currentY)
        .text("Amount", 480, currentY, {align: "right"});

      currentY += 20;
      doc
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke();

      currentY += 10;

      // Table row
      const description =
        transaction.description || "Subscription Payment";
      const planName =
        transaction.subscription?.package?.name ||
        transaction.subscription?.plan_type ||
        "N/A";
      const paymentMethod = transaction.payment_method || "N/A";
      const paymentChannel = transaction.payment_channel || "N/A";
      const amount = transaction.amount
        ? Number(transaction.amount).toFixed(2)
        : "0.00";
      const currency = transaction.currency || "PHP";

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(description, 50, currentY, {width: 180})
        .text(planName, 250, currentY, {width: 90})
        .text(`${paymentMethod} (${paymentChannel})`, 350, currentY, {
          width: 120,
        })
        .text(
          `${currency} ${parseFloat(amount).toLocaleString()}`,
          480,
          currentY,
          {align: "right", width: 70}
        );

      currentY += 30;

      // Total
      doc
        .moveTo(450, currentY)
        .lineTo(550, currentY)
        .stroke();

      currentY += 10;

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(
          `Total: ${currency} ${parseFloat(amount).toLocaleString()}`,
          450,
          currentY,
          {align: "right", width: 100}
        );

      // Footer
      const footerY = 750;
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          "Thank you for your business!",
          doc.page.width / 2,
          footerY,
          {align: "center"}
        )
        .text(
          "This is an automated invoice generated by KEEP Digital Mailroom",
          doc.page.width / 2,
          footerY + 15,
          {align: "center"}
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

