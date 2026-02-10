import { Controller, Get } from '@nestjs/common';
import { FooterService } from '../footer/footer.service';

@Controller('footer')
export class PublicFooterController {
  constructor(private readonly footerService: FooterService) {}

  @Get()
  async list() {
    const sections = await this.footerService.listPublic();
    return { data: sections };
  }
}
