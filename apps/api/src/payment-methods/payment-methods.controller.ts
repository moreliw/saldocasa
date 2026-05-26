import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentHousehold } from '../auth/decorators/current-user.decorator';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Get()
  list(@CurrentHousehold() householdId: string) {
    return this.service.list(householdId);
  }

  @Post()
  create(@CurrentHousehold() householdId: string, @Body() dto: CreatePaymentMethodDto) {
    return this.service.create(householdId, dto);
  }

  @Patch(':id')
  update(
    @CurrentHousehold() householdId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.service.update(householdId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentHousehold() householdId: string, @Param('id') id: string) {
    return this.service.remove(householdId, id);
  }
}
