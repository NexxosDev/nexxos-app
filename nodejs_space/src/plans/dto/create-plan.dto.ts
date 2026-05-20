import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Pro' }) @IsString() @IsNotEmpty() name: string;
  @ApiPropertyOptional({ example: 'pro' }) @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional({ example: 'Plan Pro con mayor capacidad' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: 500 }) @IsOptional() @IsInt() solicitudesMensuales?: number;
  @ApiPropertyOptional({ example: 3 }) @IsOptional() @IsInt() @Min(1) prioridad?: number;
  @ApiPropertyOptional({ example: 19.99 }) @IsOptional() @IsNumber() precioMensual?: number;
  @ApiPropertyOptional({ example: 199.99 }) @IsOptional() @IsNumber() precioAnual?: number;
  @ApiPropertyOptional({ example: 5 }) @IsOptional() @IsNumber() comisionPorcentaje?: number;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() visibleEnApp?: boolean;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;

  // ── Legacy fields from admin panel v1 ──
  @ApiPropertyOptional({ example: 9.99, description: 'Legacy: maps to precioMensual' }) @IsOptional() @IsNumber() price?: number;
  @ApiPropertyOptional({ example: 'monthly', description: 'Legacy: billing cycle' }) @IsOptional() @IsString() billingCycle?: string;
}
