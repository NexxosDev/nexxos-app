import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdatePlanDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() solicitudesMensuales?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) prioridad?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() precioMensual?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() precioAnual?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() comisionPorcentaje?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() visibleEnApp?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
