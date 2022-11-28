import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBase64, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EnvInformation } from '../interfaces/config.service.interface';
import { CreateSecretDto } from './create-secret.dto';



export class EnvInfoDto implements EnvInformation {


    @IsString()
    @ApiProperty({
        description: 'The name of the env',
        default: "Amoras Vermelhas",
        type: String
    })
    readonly name: string;

    @IsBase64()
    @IsOptional()
    @ApiProperty({
        description: 'Public Key obtained',
        default: "DEFAULT_BASE64",
        type: String
    })
    readonly publicKey?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Public Key Id obtained',
        default: "DEFAULT_BASE64_ID",
        type: String
    })
    readonly publicKeyId?: string;
}
export class CreateEnvSecretDto extends CreateSecretDto {

    @ApiProperty({
        description: 'Env information',
        default: "Json env information",
        type: EnvInfoDto
    })
    @ValidateNested({ each: true })
    @Type(() => EnvInfoDto)
    envInfo: EnvInfoDto;





}
