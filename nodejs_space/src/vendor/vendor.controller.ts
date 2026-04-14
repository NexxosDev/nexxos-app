import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VendorService } from './vendor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AvailabilityDto } from './dto/availability.dto';

@ApiTags('Vendor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get('profile')
  @Roles('VENDEDOR')
  @ApiOperation({ summary: 'Get current vendor profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.vendorService.getVendorProfile(userId);
  }

  @Patch('profile')
  @Roles('VENDEDOR')
  @ApiOperation({ summary: 'Update current vendor profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateVendorDto) {
    return this.vendorService.updateVendor(userId, dto);
  }

  @Patch('availability')
  @Roles('VENDEDOR')
  @ApiOperation({ summary: 'Toggle vendor availability' })
  toggleAvailability(@CurrentUser('id') userId: string, @Body() dto: AvailabilityDto) {
    return this.vendorService.toggleAvailability(userId, dto.isAvailable);
  }

  @Get('dashboard')
  @Roles('VENDEDOR')
  @ApiOperation({ summary: 'Get vendor dashboard with metrics and recent requests' })
  getDashboard(@CurrentUser('id') userId: string) {
    return this.vendorService.getDashboard(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  getVendorById(@Param('id') id: string) {
    return this.vendorService.getVendorById(id);
  }
}
