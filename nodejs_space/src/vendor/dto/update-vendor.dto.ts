import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min, Max, IsArray } from 'class-validator';

export class UpdateVendorDto {
  @ApiPropertyOptional() @IsOptional() @IsString() businessName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rif?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoPath?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() stateId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() municipalityId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(100) searchRadiusKm?: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) vehicleModelIds?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) partSubcategoryIds?: string[];
}
