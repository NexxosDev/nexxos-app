import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsString, MinLength, IsOptional,
  IsIn, ValidateNested, IsArray, IsUUID, IsInt, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VendorSignupDto {
  @ApiProperty() @IsNotEmpty() @IsString() businessName: string;
  @ApiProperty() @IsNotEmpty() @IsString() rif: string;
  @ApiProperty() @IsNotEmpty() @IsUUID() stateId: string;
  @ApiProperty() @IsNotEmpty() @IsUUID() municipalityId: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(100) searchRadiusKm?: number;
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) vehicleModelIds: string[];
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) partSubcategoryIds: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() documentImagePath?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoPath?: string;
}

export class SignupDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsNotEmpty() @MinLength(6) password: string;
  @ApiProperty() @IsNotEmpty() @IsString() firstName: string;
  @ApiProperty() @IsNotEmpty() @IsString() lastName: string;
  @ApiProperty() @IsNotEmpty() @IsString() phone: string;
  @ApiProperty() @IsNotEmpty() @IsString() documentId: string;
  @ApiProperty({ enum: ['CLIENTE', 'VENDEDOR'] }) @IsIn(['CLIENTE', 'VENDEDOR']) role: string;
  @ApiPropertyOptional({ type: VendorSignupDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VendorSignupDto)
  vendor?: VendorSignupDto;
}
