import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBase64, IsString, ValidateNested } from 'class-validator';
import { RepoInformation } from '../interfaces/config.service.interface';


export class SecretDto {

    @IsString()
    @ApiProperty({
        description: 'The name of the secret',
        default: "DEFAULT_SECRET",
        type: String
    })
    readonly name: string

    @IsString()
    @ApiProperty({
        description: 'The value of the secret',
        default: "DEFAULT_VALUE",
        type: String
    })
    readonly value: string
}

export class RepoInfoDto implements RepoInformation {

    @IsString()
    @ApiProperty({
        description: 'The owner of the repo',
        default: "Jose",
        type: String
    })
    readonly owner: string;

    @IsString()
    @ApiProperty({
        description: 'The name of the repo',
        default: "Amoras Vermelhas",
        type: String
    })
    readonly name: string;

    @IsBase64()
    @ApiProperty({
        description: 'Public Key obtained',
        default: "DEFAULT_BASE64",
        type: String
    })
    readonly publicKey: string;

    @IsString()
    @ApiProperty({
        description: 'Public Key Id obtained',
        default: "DEFAULT_BASE64_ID",
        type: String
    })
    readonly publicKeyId: string;
}
export class CreateSecretDto {

    @ApiProperty({
        description: 'Repo information',
        default: "Json repo information",
        type: RepoInfoDto
    })
    @ValidateNested({ each: true })
    @Type(() => RepoInfoDto)
    repoInfo: RepoInfoDto;

    @ApiProperty({
        description: 'Secrets to create',
        default: "Default secrets to create",
        type: [SecretDto]
    })
    @ValidateNested({ each: true })
    @Type(() => SecretDto)
    secrets: SecretDto[];
}
