import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TenantGuard } from './auth/guards/tenant.guard';
import { BudgetsModule } from './budgets/budgets.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health/health.controller';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { ReportsModule } from './reports/reports.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CategoriesModule,
    PaymentMethodsModule,
    TransactionsModule,
    RecurringTransactionsModule,
    BudgetsModule,
    DashboardModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
  ],
})
export class AppModule {}
