import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User, UserSchema } from './schemas/user.schema';
import { Entity, EntitySchema } from './schemas/entity.schema';
import { Relationship, RelationshipSchema } from './schemas/relationship.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Communication, CommunicationSchema } from './schemas/communication.schema';
import { Case, CaseSchema } from './schemas/case.schema';
import { CaseDocument, CaseDocumentSchema } from './schemas/document.schema';
import { Alert, AlertSchema } from './schemas/alert.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { Fir, FirSchema } from './schemas/fir.schema';
import { BiometricCredential, BiometricCredentialSchema } from './schemas/biometric-credential.schema';
import { AuthChallenge, AuthChallengeSchema } from './schemas/auth-challenge.schema';

const MODELS = [
  { name: User.name, schema: UserSchema },
  { name: Entity.name, schema: EntitySchema },
  { name: Relationship.name, schema: RelationshipSchema },
  { name: Transaction.name, schema: TransactionSchema },
  { name: Communication.name, schema: CommunicationSchema },
  { name: Case.name, schema: CaseSchema },
  { name: CaseDocument.name, schema: CaseDocumentSchema },
  { name: Alert.name, schema: AlertSchema },
  { name: AuditLog.name, schema: AuditLogSchema },
  { name: Fir.name, schema: FirSchema },
  { name: BiometricCredential.name, schema: BiometricCredentialSchema },
  { name: AuthChallenge.name, schema: AuthChallengeSchema },
];


@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(MODELS),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
