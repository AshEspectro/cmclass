import { Body, Controller, Post, Get, Query, BadRequestException } from '@nestjs/common';
import { MaxicashService } from './maxicash.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('maxicash')
export class MaxicashController {
    constructor(
        private maxicashService: MaxicashService,
        private notificationService: NotificationService,
        private prisma: PrismaService,
    ) { }

    @Post('initiate')
    async initiate(@Body() body: { orderId: number }) {
        if (!body.orderId) {
            throw new BadRequestException('orderId is required');
        }
        const paymentUrl = await this.maxicashService.generatePaymentUrl(body.orderId);
        return { paymentUrl };
    }

    @Post('notify')
    async notify(@Body() payload: any) {
        console.log('MaxiCash Notification received:', payload);
        const result = await this.maxicashService.handleNotification(payload);

        // If successful, create a notification for the admin
        if (payload.Status === 'Success') {
            const orderId = parseInt(payload.Reference.replace('ORDER-', ''), 10);
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: { user: true },
            });

            await this.notificationService.create({
                title: 'Nouveau paiement reçu',
                message: `La commande #${orderId} de ${order?.user?.firstName || 'un client'} a été payée via MaxiCash.`,
                type: 'ORDER',
            });
        }

        return result;
    }

    // Some implementations might use GET for simple success redirects if NotifyUrl isn't used
    @Get('success')
    async success(@Query() query: any) {
        console.log('MaxiCash Success redirect:', query);
        return { message: 'Payment successful', query };
    }
}
