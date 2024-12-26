import axios from "axios";
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Set up AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_IAM_USER_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET,
  },
});

// Function to upload the PDF to S3
const uploadToS3 = async (filePath, fileName) => {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `invoices/${fileName}`, // Store the file in the 'invoices' folder in S3
    Body: fileStream,
    ContentType: "application/pdf", // Set the content type for the PDF file
  };

  await s3.send(new PutObjectCommand(uploadParams));

  // Return the public S3 URL for the uploaded file
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/invoices/${fileName}`;
};

const ORGANIZATION_ID = process.env.ORGANIZATION_ID;; // Replace with your organization ID
const ZOHO_ACCESS_TOKEN =process.env.ZOHO_ACCESS_TOKEN;

export const getallinvoices = async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.zohoapis.in/books/v3/invoices`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
          "X-com-zoho-books-organizationid": ORGANIZATION_ID,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching invoices:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

export const downloadInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  console.log(`Requesting invoice with ID: ${invoiceId}`);


  try {
    const response = await axios.get(
      `https://www.zohoapis.in/books/v3/invoices/${invoiceId}/pdf`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
          "X-com-zoho-books-organizationid": ORGANIZATION_ID,
        },
        responseType: "stream", // Important for downloading files
      }
    );
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers: ${JSON.stringify(response.headers)}`);

    // Check if the response content type is application/pdf
    if (response.headers['content-type'] !== 'application/pdf') {
      throw new Error('Invalid response content type');
    }

    await uploadToS3(response.data, `${invoiceId}.pdf`);

    res.status(200).json({ success: true, s3Url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/invoices/${invoiceId}.pdf` });
  } catch (error) {
    console.error('Error downloading invoice:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to download invoice' });
  }
};
