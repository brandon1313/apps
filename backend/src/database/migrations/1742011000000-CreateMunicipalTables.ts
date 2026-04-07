import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMunicipalTables1742011000000 implements MigrationInterface {
  name = 'CreateMunicipalTables1742011000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE plate_type_enum AS ENUM ('M', 'P', 'C');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `)

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE fine_status_enum AS ENUM ('PENDING', 'PAID', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `)

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE water_bill_status_enum AS ENUM ('PENDING', 'PAID');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `)

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE ornato_ticket_status_enum AS ENUM ('PENDING', 'PAID');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name varchar(180) NOT NULL,
        dpi varchar(32) NOT NULL UNIQUE,
        email varchar(180) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        phone_number varchar(32),
        role role_enum NOT NULL DEFAULT 'USER',
        is_active boolean NOT NULL DEFAULT true,
        last_login_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        reference varchar(64) NOT NULL UNIQUE,
        type payment_type_enum NOT NULL,
        status payment_status_enum NOT NULL DEFAULT 'PENDING',
        amount numeric(12, 2) NOT NULL,
        currency varchar(8) NOT NULL DEFAULT 'GTQ',
        payer_user_id uuid,
        payer_name varchar(180),
        payer_dpi varchar(32),
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        external_transaction_id varchar(128),
        processed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_payments_payer_user
          FOREIGN KEY (payer_user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        token_hash varchar(255) NOT NULL,
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz,
        replaced_by_token_id uuid,
        user_agent varchar(255),
        ip_address varchar(64),
        user_id uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_refresh_tokens_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS news_posts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug varchar(220) NOT NULL UNIQUE,
        title varchar(220) NOT NULL,
        summary text NOT NULL,
        cover_image_url text NOT NULL,
        content jsonb NOT NULL,
        status news_status_enum NOT NULL DEFAULT 'DRAFT',
        published_at timestamptz,
        author_id uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_news_posts_author
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS traffic_fines (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        plate_type plate_type_enum NOT NULL,
        plate_number varchar(16) NOT NULL,
        issued_at timestamptz NOT NULL,
        reason varchar(220) NOT NULL,
        evidence_notes text,
        evidence_photo_url text,
        amount numeric(12, 2) NOT NULL,
        status fine_status_enum NOT NULL DEFAULT 'PENDING',
        payment_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_traffic_fines_payment
          FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS water_accounts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        meter_number varchar(64) NOT NULL UNIQUE,
        address varchar(255) NOT NULL,
        account_holder_name varchar(180) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS water_bills (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        water_account_id uuid NOT NULL,
        billing_period varchar(32) NOT NULL,
        due_date date NOT NULL,
        amount numeric(12, 2) NOT NULL,
        status water_bill_status_enum NOT NULL DEFAULT 'PENDING',
        payment_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_water_bills_account
          FOREIGN KEY (water_account_id) REFERENCES water_accounts(id) ON DELETE CASCADE,
        CONSTRAINT fk_water_bills_payment
          FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ornato_tickets (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(180) NOT NULL,
        dpi varchar(32) NOT NULL,
        amount numeric(12, 2) NOT NULL,
        status ornato_ticket_status_enum NOT NULL DEFAULT 'PENDING',
        payment_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_ornato_tickets_payment
          FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ornato_tickets;`)
    await queryRunner.query(`DROP TABLE IF EXISTS water_bills;`)
    await queryRunner.query(`DROP TABLE IF EXISTS water_accounts;`)
    await queryRunner.query(`DROP TABLE IF EXISTS traffic_fines;`)
    await queryRunner.query(`DROP TABLE IF EXISTS news_posts;`)
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens;`)
    await queryRunner.query(`DROP TABLE IF EXISTS payments;`)
    await queryRunner.query(`DROP TABLE IF EXISTS users;`)

    await queryRunner.query(`DROP TYPE IF EXISTS ornato_ticket_status_enum;`)
    await queryRunner.query(`DROP TYPE IF EXISTS water_bill_status_enum;`)
    await queryRunner.query(`DROP TYPE IF EXISTS fine_status_enum;`)
    await queryRunner.query(`DROP TYPE IF EXISTS plate_type_enum;`)
  }
}
