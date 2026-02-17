import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Global() // Make it global so it's available everywhere
@Module({
    providers: [CloudinaryService],
    exports: [CloudinaryService],
})
export class CloudinaryModule { }
