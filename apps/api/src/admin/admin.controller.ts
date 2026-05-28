import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionTier } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SuperAdmin } from '../auth/decorators/super-admin.decorator';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import type { AuthUser } from '../auth/types';
import { AdminService } from './admin.service';
import { UpdatePlanDto } from './dto/update-plan.dto';

@SuperAdmin()
@UseGuards(SuperAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview() {
    return this.admin.overview();
  }

  @Get('households')
  listHouseholds(
    @Query('q') q?: string,
    @Query('tier') tier?: SubscriptionTier,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.listHouseholds({
      q,
      tier,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
    });
  }

  @Patch('households/:id/plan')
  updateHouseholdPlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.admin.updateHouseholdPlan(id, dto);
  }

  @Get('users')
  listUsers(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.listUsers({
      q,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
    });
  }

  @Post('users/:id/toggle-admin')
  toggleSuperAdmin(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.admin.toggleSuperAdmin(id, user.id);
  }
}
