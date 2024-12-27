import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtValidationService {
  private readonly cognitoIssuer = `https://cognito-idp.us-east-2.amazonaws.com/${process.env.AWS_USER_POOLS_ID}`;

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      const { header, payload } = decoded as {
        header: jwt.JwtHeader;
        payload: jwt.JwtPayload;
      };

      if (payload.exp && Date.now() / 1000 > payload.exp) {
        throw new UnauthorizedException('Token has expired');
      }

      if (payload.iss !== this.cognitoIssuer) {
        throw new UnauthorizedException('Invalid issuer');
      }

      if (payload.aud !== process.env.AWS_CLIENT_ID) {
        throw new UnauthorizedException('Invalid audience');
      }

      if (!['id', 'access'].includes(payload.token_use)) {
        throw new UnauthorizedException('Invalid token use');
      }

      // Verify the signature using the public key
      const publicKey = await this.getPublicKey(header.kid);
      const verifiedToken = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: this.cognitoIssuer,
      });
      return verifiedToken;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private async getPublicKey(kid: string): Promise<string> {
    const jwksClient = jwksRsa({
      jwksUri: `${this.cognitoIssuer}/.well-known/jwks.json`,
    });
    return new Promise((resolve, reject) => {
      jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(new UnauthorizedException('Unable to get public key'));
        }
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      });
    });
  }
}
