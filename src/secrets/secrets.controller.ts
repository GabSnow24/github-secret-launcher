import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { CreateSecretDto } from './dto/create-secret.dto';
import { RepoInformation } from './interfaces/config.service.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilePipe } from 'src/common/pipes/file.pipe';
import { Headers } from '@nestjs/common';

@Controller('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) { }
  //TODO: RECEIVE AUTHORIZATION BEARER IN ENDPOINTS
  @Post()

  create(@Body() createSecretDto: CreateSecretDto) {
    return this.secretsService.create(createSecretDto);
  }

  @Post("withForm/:owner/:name/")
  @UseInterceptors(FileInterceptor('file'))
  createWithForm(@UploadedFile(new FilePipe()) file: [{
    name: "",
    value: ""
  }], @Param('owner') owner: string, @Param('name') name: string, @Headers('Public-Key') publicKey: string, @Headers('Public-Key-Id') publicKeyId: string,) {
    const dtoToSend: CreateSecretDto = {
      repoInfo: {
        owner,
        name,
        publicKey,
        publicKeyId
      },
      secrets: file
    }
    return this.secretsService.create(dtoToSend);
  }

  @Get()
  findAll() {
    return this.secretsService.findAll();
  }

  @Get('publicKey/:owner/:name')
  getPublicKey(@Param('owner') owner: string, @Param('name') name: string) {
    const dataToSend: RepoInformation = {
      owner,
      name
    }
    return this.secretsService.getPublicKey(dataToSend);
  }

}
