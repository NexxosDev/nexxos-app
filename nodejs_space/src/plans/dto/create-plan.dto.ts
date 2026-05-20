import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Pro' }) @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ example: 'pro' }) @IsString() @IsNotEmpty() slug: string;
  @ApiPropertyOptional({ example: 'Plan Pro con mayor capacidad' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 500 }) @IsInt() solicitudesMensuales: number;
  @ApiProperty({ example: 3 }) @IsInt() @Min(1) prioridad: number;
  @ApiPropertyOptional({ example: 19.99 }) @IsOptional() @IsNumber() precioMensual?: number;
  @ApiPropertyOptional({ example: 199.99 }) @IsOptional() @IsNumber() precioAnual?: number;
  @ApiPropertyOptional({ example: 5 }) @IsOptional() @IsNumber() comisionPorcentaje?: number;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() visibleEnApp?: boolean;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
