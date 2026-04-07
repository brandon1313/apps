import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPoliceRoleAndFineAgent1743600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "role_enum" ADD VALUE IF NOT EXISTS 'POLICE'`)
    await queryRunner.query(`
      ALTER TABLE "traffic_fines"
        ADD COLUMN IF NOT EXISTS "issued_by_agent_id" uuid NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "traffic_fines"
        DROP COLUMN IF EXISTS "issued_by_agent_id"
    `)
    // Note: PostgreSQL does not support removing enum values natively.
    // To fully revert, recreate the enum without POLICE.
  }
}
