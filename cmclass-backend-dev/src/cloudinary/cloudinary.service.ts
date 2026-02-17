import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    constructor() {
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    /**
     * Upload a file to Cloudinary
     * @param file - The file to upload (Express.Multer.File)
     * @param folder - The folder in Cloudinary to upload to (e.g., 'products', 'categories')
     * @returns The secure URL of the uploaded file
     */
    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'cmclass'
    ): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        return new Promise<string>((resolve, reject) => {
            // Create a readable stream from the buffer
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `cmclass/${folder}`,
                    resource_type: 'auto', // Automatically detect the resource type
                    // Skip transformations for SVGs to preserve vector quality
                    transformation: file.mimetype === 'image/svg+xml' ? undefined : [
                        { quality: 'auto:good' }, // Automatic quality optimization
                        { fetch_format: 'auto' }, // Automatic format optimization (WebP, AVIF)
                    ],
                },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new BadRequestException(`Upload failed: ${error.message}`));
                    } else if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(new BadRequestException('Upload failed: No result returned'));
                    }
                }
            );

            // Convert buffer to stream and pipe to Cloudinary
            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);
            bufferStream.pipe(uploadStream);
        });
    }

    /**
     * Delete a file from Cloudinary
     * @param publicId - The public ID of the file to delete
     * @returns Success status
     */
    async deleteFile(publicId: string): Promise<boolean> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            return false;
        }
    }

    /**
     * Extract public ID from Cloudinary URL
     * @param url - The Cloudinary URL
     * @returns The public ID
     */
    getPublicIdFromUrl(url: string): string {
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg
        // Public ID: sample
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];

        // Get folder path if exists
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex > -1 && uploadIndex < parts.length - 2) {
            const folderParts = parts.slice(uploadIndex + 2, parts.length - 1);
            return [...folderParts, publicId].join('/');
        }

        return publicId;
    }
}
