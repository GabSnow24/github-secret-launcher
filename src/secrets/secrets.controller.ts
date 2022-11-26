import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { CreateSecretDto } from './dto/create-secret.dto';
import { RepoInformation } from './interfaces/config.service.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilePipe } from 'src/common/pipes/file.pipe';
import { Headers } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiFile } from 'src/common/decorators/file.decorator';
import { ResponseGetSecretDto } from './dto/response-secret.dto';

@Controller('secrets')
@ApiTags('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) { }
  //TODO: RECEIVE AUTHORIZATION BEARER IN ENDPOINTS
  @Post()

  @ApiBody({ type: [CreateSecretDto] })
  @ApiOperation({ summary: 'Create secrets using JSON' })
  @ApiResponse({ status: 201, description: 'The secrets has been successfully created.' })
  create(@Body() createSecretDto: CreateSecretDto) {
    return this.secretsService.create(createSecretDto);
  }

  @Post("withForm/:owner/:name/")
  @ApiHeader({ name: "Public-Key" })
  @ApiHeader({ name: "Public-Key-Id" })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'The secrets has been successfully created.' })
  @ApiParam({ name: "owner" })
  @ApiParam({ name: "name" })
  @ApiFile()
  @ApiOperation({ summary: 'Create secrets using .TXT' })
  @UseInterceptors(FileInterceptor('file'))
  createWithForm(@UploadedFile(new FilePipe()) file: Express.Multer.File, @Param('owner') owner: string, @Param('name') name: string, @Headers('Public-Key') publicKey: string, @Headers('Public-Key-Id') publicKeyId: string,) {
    const dtoToSend: CreateSecretDto = {
      repoInfo: {
        owner,
        name,
        publicKey,
        publicKeyId
      },
      secrets: file as unknown as [{
        name: string,
        value: string
      }]
    }
    return this.secretsService.create(dtoToSend);
  }

  @Get('publicKey/:owner/:name')
  @ApiParam({ name: "owner" })
  @ApiParam({ name: "name" })
  @ApiResponse({
    status: 200,
    description: 'The keys have been redeem.',
    type: ResponseGetSecretDto,
  })
  @ApiOperation({ summary: 'Get public key and public key id of repo' })
  getPublicKey(@Param('owner') owner: string, @Param('name') name: string) {
    const dataToSend: RepoInformation = {
      owner,
      name
    }
    return this.secretsService.getPublicKey(dataToSend);
  }

}
