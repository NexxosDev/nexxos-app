import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() stateId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() municipalityId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(5) @Max(30) searchRadiusKm?: number;
  @ApiProperty() @IsUUID() vehicleBrandId: string;
  @ApiProperty() @IsUUID() vehicleModelId: string;
  @ApiProperty() @IsUUID() partCategoryId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() partSubcategoryId?: string;
  @ApiProperty() @IsNotEmpty() @IsString() freeDescription: string;
}
