import { BlobServiceClient, ContainerClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const containerName = "note-uploads"; // Container for note attachments

// Extract account name and key from connection string
function getAccountInfo() {
  const parts = connectionString.split(";");
  let accountName = "";
  let accountKey = "";
  
  parts.forEach(part => {
    if (part.startsWith("AccountName=")) {
      accountName = part.split("=")[1];
    }
    if (part.startsWith("AccountKey=")) {
      accountKey = part.split("=")[1];
    }
  });
  
  return { accountName, accountKey };
}

let blobServiceClient: BlobServiceClient | null = null;
let containerClient: ContainerClient | null = null;

export async function getContainerClient(): Promise<ContainerClient> {
  if (!connectionString) {
    throw new Error("Azure Storage connection string not found");
  }

  if (!containerClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    // Note: We don't specify access level since the storage account doesn't allow public access
    try {
      await containerClient.createIfNotExists();
      console.log("Container created or already exists:", containerName);
    } catch (error: any) {
      // If container creation fails, check if it already exists
      const exists = await containerClient.exists();
      if (!exists) {
        console.error("Error creating container and it doesn't exist:", error);
        throw error;
      }
      // Container exists, continue
      console.log("Container already exists, continuing:", containerName);
    }
  }

  return containerClient;
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const containerClient = await getContainerClient();
  
  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const blobName = `${timestamp}-${sanitizedFileName}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });

  // Generate SAS URL for the blob (valid for 1 year)
  const { accountName, accountKey } = getAccountInfo();
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  
  const sasQueryParams = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // Read permission only
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
    sharedKeyCredential
  );

  const sasUrl = `${blockBlobClient.url}?${sasQueryParams.toString()}`;
  return sasUrl;
}

export async function deleteFile(blobUrl: string): Promise<void> {
  try {
    const containerClient = await getContainerClient();
    // Extract blob name from URL (remove query parameters if present)
    const urlWithoutQuery = blobUrl.split("?")[0];
    const blobName = urlWithoutQuery.split("/").pop();
    
    if (blobName) {
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

