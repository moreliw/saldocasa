import { Controller, Get, Query } from '@nestjs/common';
import { CurrentHousehold } from '../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryQueryDto } from './dto/dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  summary(@CurrentHousehold() householdId: string, @Query() query: DashboardSummaryQueryDto) {
    return this.service.summary(householdId, query);
  }
}
