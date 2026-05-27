import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CurrentHousehold, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { AuthUser } from '../auth/types';
import { AcceptInviteDto, CreateInviteDto } from './dto/invite.dto';
import { HouseholdsService } from './households.service';

@Controller()
export class HouseholdsController {
  constructor(private readonly service: HouseholdsService) {}

  @Get('households/current')
  current(@CurrentHousehold() householdId: string) {
    return this.service.getHousehold(householdId);
  }

  @Get('households/members')
  members(@CurrentHousehold() householdId: string) {
    return this.service.getMembers(householdId);
  }

  @Get('households/invites')
  invites(@CurrentHousehold() householdId: string) {
    return this.service.listInvites(householdId);
  }

  @Post('households/invites')
  createInvite(
    @CurrentHousehold() householdId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInviteDto,
  ) {
    return this.service.createInvite(householdId, user.id, dto);
  }

  @Delete('households/invites/:id')
  revokeInvite(
    @CurrentHousehold() householdId: string,
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.service.revokeInvite(householdId, user.id, id);
  }

  /**
   * Aceitar convite: precisa estar logado, mas independe do household corrente
   * (TenantGuard usa primeira membership; pra novo user que acabou de aceitar,
   * a próxima request já retorna a nova household se for a única).
   */
  @Post('auth/accept-invite')
  @HttpCode(200)
  acceptInvite(@CurrentUser() user: AuthUser, @Body() dto: AcceptInviteDto) {
    return this.service.acceptInvite(user.id, dto);
  }

  /**
   * Endpoint público pra resolver detalhes do convite antes do user aceitar
   * (mostra nome da casa, quem convidou, validade).
   */
  @Public()
  @Get('invites/:token')
  preview(@Param('token') token: string) {
    return this.service.previewInvite(token);
  }
}
