import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { RepoInformation } from '../interfaces/config.service.interface';


export class SecretDto {

    @IsString()
    readonly name: string

    @IsString()
    readonly value: string
}

export class RepoInfoDto implements RepoInformation {

    @IsString()
    readonly owner: string;

    @IsString()
    readonly name: string;

    @IsString()
    readonly publicKey: string;

    @IsString()
    readonly publicKeyId: string;
}
export class CreateSecretDto {

    @ValidateNested({ each: true })
    @Type(() => RepoInfoDto)
    repoInfo: RepoInfoDto;

    @ValidateNested({ each: true })
    @Type(() => SecretDto)
    secrets: SecretDto[];
}
