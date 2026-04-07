import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserLoginLockout1742012000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "failed_login_attempts" integer NOT NULL DEFAULT 0,
        ADD COLUMN "locked_until" TIMESTAMPTZ NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "failed_login_attempts",
        DROP COLUMN "locked_until"
    `)
  }
}
