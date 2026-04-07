import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialMunicipalPlatform1742010000000 implements MigrationInterface {
  name = 'InitialMunicipalPlatform1742010000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE role_enum AS ENUM ('ADMIN', 'WRITER', 'USER');
      CREATE TYPE news_status_enum AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
      CREATE TYPE payment_type_enum AS ENUM ('TRAFFIC_FINE', 'WATER_BILL', 'ORNATO');
      CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TYPE payment_status_enum;
      DROP TYPE payment_type_enum;
      DROP TYPE news_status_enum;
      DROP TYPE role_enum;
    `)
  }
}
