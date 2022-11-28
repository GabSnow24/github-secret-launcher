import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { CreateSecretDto as CreateRepositorySecretDto } from './dto/create-secret.dto';
import { EnvInformation, RepoInformation } from './interfaces/config.service.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilePipe } from 'src/common/pipes/file.pipe';
import { Headers } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiFile } from 'src/common/decorators/file.decorator';
import { ResponseGetSecretDto } from './dto/response-secret.dto';
import { CreateEnvSecretDto } from './dto/create-env-secret.dto';

@Controller('secrets')
@ApiTags('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) { }
  //TODO: RECEIVE AUTHORIZATION BEARER IN ENDPOINTS
  @Post('repository')
  @ApiBody({ type: [CreateRepositorySecretDto] })
  @ApiOperation({ summary: 'Create repository secrets using JSON' })
  @ApiResponse({ status: 201, description: 'The secrets has been successfully created.' })
  createRepositorySecrets(@Body() createSecretDto: CreateRepositorySecretDto) {
    return this.secretsService.createRepositorySecrets(createSecretDto);
  }

  @Post('environment')
  @ApiBody({ type: [CreateEnvSecretDto] })
  @ApiOperation({ summary: 'Create environment secrets using JSON' })
  @ApiResponse({ status: 201, description: 'The secrets has been successfully created.' })
  createEnvSecret(@Body() createSecretDto: CreateEnvSecretDto) {
    return this.secretsService.createEnvSecrets(createSecretDto);
  }

  @Post("repository/withForm/:owner/:name/")
  @ApiHeader({ name: "Public-Key" })
  @ApiHeader({ name: "Public-Key-Id" })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'The secrets has been successfully created.' })
  @ApiParam({ name: "owner" })
  @ApiParam({ name: "name" })
  @ApiFile()
  @ApiOperation({ summary: 'Create repository secrets using .TXT' })
  @UseInterceptors(FileInterceptor('file'))
  createRepositorySecretsWithForm(@UploadedFile(new FilePipe()) file: Express.Multer.File, @Param('owner') owner: string, @Param('name') name: string, @Headers('Public-Key') publicKey: string, @Headers('Public-Key-Id') publicKeyId: string,) {
    const dtoToSend: CreateRepositorySecretDto = {
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
    return this.secretsService.createRepositorySecrets(dtoToSend);
  }

  @Post("environment/withForm/:owner/:name/:envName")
  @ApiHeader({ name: "Public-Key" })
  @ApiHeader({ name: "Public-Key-Id" })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'The secrets has been successfully created.' })
  @ApiParam({ name: "owner" })
  @ApiParam({ name: "name" })
  @ApiParam({ name: "envName" })
  @ApiFile()
  @ApiOperation({ summary: 'Create environment secrets using .TXT' })
  @UseInterceptors(FileInterceptor('file'))
  createEnvSecretsWithForm(@UploadedFile(new FilePipe()) file: Express.Multer.File, @Param('owner') owner: string, @Param('name') name: string, @Param('envName') envName: string, @Headers('Public-Key') publicKey: string, @Headers('Public-Key-Id') publicKeyId: string,) {
    const dtoToSend: CreateEnvSecretDto = {
      repoInfo: {
        owner,
        name,
      },
      envInfo: {
        name: envName,
        publicKey,
        publicKeyId
      },
      secrets: file as unknown as [{
        name: string,
        value: string
      }]
    }
    return this.secretsService.createEnvSecrets(dtoToSend);
  }

  @Get('repository/publicKey/:owner/:name')
  @ApiParam({ name: "owner" })
  @ApiParam({ name: "name" })
  @ApiResponse({
    status: 200,
    description: 'The keys have been redeem.',
    type: ResponseGetSecretDto,
  })
  @ApiOperation({ summary: 'Get public key and public key id of repo' })
  getRepositoryPublicKey(@Param('owner') owner: string, @Param('name') name: string) {
    const dataToSend: RepoInformation = {
      owner,
      name
    }
    return this.secretsService.getRepositoryPublicKey(dataToSend);
  }

  @Get('environment/publicKey/:owner/:repoName/:envName')
  @ApiParam({ name: "owner" })
  @ApiParam({ name: "repoName" })
  @ApiParam({ name: "envName" })
  @ApiResponse({
    status: 200,
    description: 'The keys have been redeem.',
    type: ResponseGetSecretDto,
  })
  @ApiOperation({ summary: 'Get public key and public key id of environment' })
  getEnvPublicKey(@Param('owner') owner: string, @Param('repoName') repoName: string, @Param('envName') envName: string) {
    const repoDataToSend: RepoInformation = {
      owner,
      name: repoName
    }

    const envDataToSend: EnvInformation = {
      name: envName
    }
    return this.secretsService.getEnvPublicKey(envDataToSend, repoDataToSend);
  }

  @Get('repoInfo/publicKey/:owner/:repoName')
  @ApiParam({ name: "owner" })
  @ApiParam({ name: "repoName" })
  @ApiResponse({
    status: 200,
    description: 'The keys have been redeem.',
    type: ResponseGetSecretDto,
  })
  @ApiOperation({ summary: 'Get repository information' })
  getRepoInfo(@Param('owner') owner: string, @Param('repoName') repoName: string) {
    const repoDataToSend: RepoInformation = {
      owner,
      name: repoName
    }
    return this.secretsService.getRepoInfo(repoDataToSend);
  }
}
