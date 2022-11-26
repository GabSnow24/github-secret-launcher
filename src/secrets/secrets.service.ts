import { Injectable } from '@nestjs/common';
import { CreateSecretDto } from './dto/create-secret.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { secretbox, randomBytes } from "tweetnacl";
import {
  decodeUTF8,
  encodeBase64,
  decodeBase64
} from "tweetnacl-util";

import { GithubVariables, RepoInformation } from './interfaces/config.service.interface';

@Injectable()
export class SecretsService {
  private githubUrl: string
  private githubToken: string


  constructor(private configService: ConfigService, private readonly httpService: HttpService) {
    this.githubUrl = this.configService.get<GithubVariables>('github').url;
    this.githubToken = this.configService.get<GithubVariables>('github').token;
  }

  async create(createSecretDto: CreateSecretDto): Promise<void> {
    const { secrets, repoInfo } = createSecretDto

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

  async findAll() {

  }

  async getPublicKey(repoInfo: RepoInformation): Promise<{ key_id: string, key: string }> {
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
