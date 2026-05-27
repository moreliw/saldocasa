import { Controller, Get, Query } from '@nestjs/common';
import { CurrentHousehold } from '../auth/decorators/current-user.decorator';
import {
  ByCategoryQueryDto,
  MonthlyComparisonQueryDto,
  PeriodQueryDto,
} from './dto/report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('cash-flow')
  cashFlow(@CurrentHousehold() householdId: string, @Query() query: PeriodQueryDto) {
    return this.service.cashFlow(householdId, query);
  }

  @Get('by-category')
  byCategory(@CurrentHousehold() householdId: string, @Query() query: ByCategoryQueryDto) {
    return this.service.byCategory(householdId, query);
  }

  @Get('by-payment-method')
  byPaymentMethod(@CurrentHousehold() householdId: string, @Query() query: PeriodQueryDto) {
    return this.service.byPaymentMethod(householdId, query);
  }

  @Get('monthly-comparison')
  monthlyComparison(
    @CurrentHousehold() householdId: string,
    @Query() query: MonthlyComparisonQueryDto,
  ) {
    return this.service.monthlyComparison(householdId, query);
  }
}
