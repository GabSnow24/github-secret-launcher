import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class ResponseGetSecretDto {

    @IsString()
    @ApiProperty({
        description: 'Public Key obtained',
        default: "DEFAULT_BASE64",
        type: String
    })
    readonly key: string

    @IsString()
    @ApiProperty({
        description: 'Public Key Id obtained',
        default: "DEFAULT_BASE64_ID",
        type: String
    })
    readonly key_id: string
}