import { Injectable } from '@nestjs/common';
import { CreateSecretDto as CreateRepositorySecretDto } from './dto/create-secret.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { secretbox, randomBytes } from "tweetnacl";
import {
  decodeUTF8,
  encodeBase64,
  decodeBase64
} from "tweetnacl-util";

import { EnvInformation, GithubVariables, RepoInformation } from './interfaces/config.service.interface';
import { CreateEnvSecretDto } from './dto/create-env-secret.dto';

@Injectable()
export class SecretsService {
  private githubUrl: string
  private githubToken: string


  constructor(private configService: ConfigService, private readonly httpService: HttpService) {
    this.githubUrl = this.configService.get<GithubVariables>('github').url;
    this.githubToken = this.configService.get<GithubVariables>('github').token;
  }

  async createRepositorySecrets(createRepoSecretDto: CreateRepositorySecretDto): Promise<void> {
    const { secrets, repoInfo } = createRepoSecretDto

    secrets.map(async (secret) => {

      const encryptedValue = await this.encryptSecret(secret.value, repoInfo.publicKey)

      const dataToSend = {
        owner: repoInfo.owner,
        repo: repoInfo.name,
        secret_name: secret.name,
        encrypted_value: encryptedValue,
        key_id: repoInfo.publicKeyId
      }
      return lastValueFrom(
        this.httpService.put(`${this.githubUrl}/repos/${repoInfo.owner}/${repoInfo.name}/actions/secrets/${secret.name}`, dataToSend, {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${this.githubToken}`
          }
        })
      )
    })
  }

  async createEnvSecrets(createEnvSecretDto: CreateEnvSecretDto): Promise<void> {
    const { secrets, envInfo, repoInfo } = createEnvSecretDto
    const foundedRepoInfo = await this.getRepoInfo(repoInfo)
    secrets.map(async (secret) => {

      const encryptedValue = await this.encryptSecret(secret.value, envInfo.publicKey)

      const dataToSend = {
        encrypted_value: encryptedValue,
        key_id: envInfo.publicKeyId
      }
      return lastValueFrom(
        this.httpService.put(`${this.githubUrl}/repositories/${foundedRepoInfo.id}/environments/${envInfo.name}/secrets/${secret.name}`, dataToSend, {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${this.githubToken}`
          }
        })
      )
    })
  }


  async getRepositoryPublicKey(repoInfo: RepoInformation): Promise<{ key_id: string, key: string }> {
    const { data } = await lastValueFrom(
      this.httpService.get(`${this.githubUrl}/repos/${repoInfo.owner}/${repoInfo.name}/actions/secrets/public-key`, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.githubToken}`
        }
      })
    )
    return data;
  }


  async getEnvPublicKey(envInfo: EnvInformation, repoInfo: RepoInformation,): Promise<{ key_id: string, key: string }> {

    const foundedRepoInfo = await this.getRepoInfo(repoInfo)
    const { data } = await lastValueFrom(
      this.httpService.get(`${this.githubUrl}/repositories/${foundedRepoInfo.id}/environments/${envInfo.name}/secrets/public-key`, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.githubToken}`
        }
      })
    )
    return data;
  }


  async getRepoInfo(repoInfo: RepoInformation): Promise<{ id: string }> {
    const { data } = await lastValueFrom(
      this.httpService.get(`${this.githubUrl}/repos/${repoInfo.owner}/${repoInfo.name}`, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.githubToken}`
        }
      })
    )
    return data;
  }



  async encryptSecret(secret: string, key: string) {
    const keyUint8Array = decodeBase64(key);
    const newNonce = () => randomBytes(secretbox.nonceLength);
    const nonce = newNonce();
    const messageUint8 = decodeUTF8(JSON.stringify(secret));
    const box = secretbox(messageUint8, nonce, keyUint8Array);

    const fullMessage = new Uint8Array(nonce.length + box.length);
    fullMessage.set(nonce);
    fullMessage.set(box, nonce.length);

    return encodeBase64(fullMessage);

  }

}
