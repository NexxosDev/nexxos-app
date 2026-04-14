import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty() @IsUUID() stateId: string;
  @ApiProperty() @IsUUID() municipalityId: string;
  @ApiProperty() @IsInt() @Min(5) @Max(30) searchRadiusKm: number;
  @ApiProperty() @IsUUID() vehicleBrandId: string;
  @ApiProperty() @IsUUID() vehicleModelId: string;
  @ApiProperty() @IsUUID() partCategoryId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() partSubcategoryId?: string;
  @ApiProperty() @IsNotEmpty() @IsString() freeDescription: string;
}
