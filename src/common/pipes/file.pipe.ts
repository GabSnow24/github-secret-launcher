import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FilePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const textDecoded = Buffer.from(value.buffer).toString()
        const splited = textDecoded.split('\r\n')
        const cleaned = this.verifyAndClean(splited)
        const secretDto = cleaned.map((secret) => {
            const formattedKey = secret.split("=")[0].trim()
            const formattedValue = secret.split("=")[1].trim()
            return { name: formattedKey, value: formattedValue }
        })

        return secretDto;
    }

    private verifyAndClean(secrets: string[]) {
        return secrets.flatMap((secret) => {
            if (secret[0] == ("#" || "//") || secret == "" || !secret.includes("=")) {
                return []
            }
            return secret
        })
    }
}