declare class CloudinaryService {
    constructor();
    /**
     * Upload receipt image to Cloudinary
     */
    uploadReceipt(file: Express.Multer.File, userId: string): Promise<string>;
    /**
     * Delete receipt from Cloudinary
     */
    deleteReceipt(publicId: string): Promise<void>;
}
declare const _default: CloudinaryService;
export default _default;
//# sourceMappingURL=CloudinaryService.d.ts.map